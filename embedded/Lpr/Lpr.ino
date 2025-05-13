#include <Arduino.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include "esp_camera.h"
#include "soc/soc.h"
#include "soc/rtc_cntl_reg.h"
#include <PubSubClient.h>
#include <ESP32Servo.h>

// === Camera Pins ===
#define PWDN_GPIO_NUM     32
#define RESET_GPIO_NUM    -1
#define XCLK_GPIO_NUM      0
#define SIOD_GPIO_NUM     26
#define SIOC_GPIO_NUM     27
#define Y9_GPIO_NUM       35
#define Y8_GPIO_NUM       34
#define Y7_GPIO_NUM       39
#define Y6_GPIO_NUM       36
#define Y5_GPIO_NUM       21
#define Y4_GPIO_NUM       19
#define Y3_GPIO_NUM       18
#define Y2_GPIO_NUM        5
#define VSYNC_GPIO_NUM    25
#define HREF_GPIO_NUM     23
#define PCLK_GPIO_NUM     22

// === Servo Configuration ===
Servo myservo;
const int servoPin = 14;

// === Button Config ===
const int buttonPin = 12;
bool buttonPressed = false;

// === WiFi Config ===
const char* ssid = "Galaxy";
const char* password = "00000000";

// === MQTT Config ===
const char* mqtt_server = "192.168.155.25";
WiFiClient wifiClient;
PubSubClient mqttClient(wifiClient);

// === Flask Server Config ===
const char* flaskServer = "http://192.168.155.25:5000/api/lpr";

// === Backend Config ===
const char* backendServer = "192.168.155.25";
const int backendPort = 4000;
const String checkPlateEndpoint = "/api/lpr/check-vehicle";

// === LED Config ===
const int ledPin = 4; // Flash disabled, kept for potential future use

void publishLog(String message) {
  if (mqttClient.connected()) {
    mqttClient.publish("lpr/logs", message.c_str());
  }
  Serial.println("MQTT Log: " + message);
}

void setupCamera() {
  camera_config_t config;
  config.ledc_channel = LEDC_CHANNEL_0;
  config.ledc_timer = LEDC_TIMER_0;
  config.pin_d0 = Y2_GPIO_NUM;
  config.pin_d1 = Y3_GPIO_NUM;
  config.pin_d2 = Y4_GPIO_NUM;
  config.pin_d3 = Y5_GPIO_NUM;
  config.pin_d4 = Y6_GPIO_NUM;
  config.pin_d5 = Y7_GPIO_NUM;
  config.pin_d6 = Y8_GPIO_NUM;
  config.pin_d7 = Y9_GPIO_NUM;
  config.pin_xclk = XCLK_GPIO_NUM;
  config.pin_pclk = PCLK_GPIO_NUM;
  config.pin_vsync = VSYNC_GPIO_NUM;
  config.pin_href = HREF_GPIO_NUM;
  config.pin_sscb_sda = SIOD_GPIO_NUM;
  config.pin_sscb_scl = SIOC_GPIO_NUM;
  config.pin_pwdn = PWDN_GPIO_NUM;
  config.pin_reset = RESET_GPIO_NUM;
  config.xclk_freq_hz = 20000000;
  config.pixel_format = PIXFORMAT_JPEG;

  if (psramFound()) {
    config.frame_size = FRAMESIZE_XGA; // 1024x768 for higher detail
    config.jpeg_quality = 6; // Minimal compression
    config.fb_count = 2;
    config.grab_mode = CAMERA_GRAB_LATEST;
  } else {
    config.frame_size = FRAMESIZE_SVGA; // 800x600 fallback
    config.jpeg_quality = 8;
    config.fb_count = 1;
  }

  esp_err_t err = esp_camera_init(&config);
  if (err != ESP_OK) {
    publishLog("Camera init failed with error 0x" + String(err, HEX));
    ESP.restart();
  }

  sensor_t *s = esp_camera_sensor_get();
  s->set_vflip(s, 1); // Vertical flip
  s->set_hmirror(s, 1); // Horizontal mirror
  s->set_framesize(s, FRAMESIZE_XGA); // Match config
  s->set_brightness(s, 1); // Moderate brightness (+1) to reduce glare
  s->set_contrast(s, 1); // Moderate contrast (+1) for clarity
  s->set_saturation(s, 0); // Normal saturation
  s->set_sharpness(s, 3); // Maximum sharpness for plate text
  s->set_whitebal(s, 1); // Enable auto white balance
  s->set_awb_gain(s, 1); // Enable auto white balance gain
  s->set_exposure_ctrl(s, 1); // Enable auto exposure for adaptability
  s->set_aec_value(s, 150); // Moderate exposure to reduce phone screen glare
  s->set_special_effect(s, 0); // No special effects
  s->set_wb_mode(s, 0); // Auto white balance for varying lighting

  publishLog("Camera setup complete. Resolution: XGA, Quality: 6");
}

void resetCamera() {
  esp_camera_deinit();
  delay(200); // Increased for stability
  setupCamera();
  publishLog("Camera reinitialized");
}

void setup() {
  WRITE_PERI_REG(RTC_CNTL_BROWN_OUT_REG, 0); // Disable brownout detector
  Serial.begin(115200);
  Serial.setDebugOutput(true);
  Serial.println();

  // Setup servo with stable initialization
  ESP32PWM::allocateTimer(0);
  myservo.setPeriodHertz(50);
  myservo.attach(servoPin, 600, 2400); // Adjusted min pulse to 600µs for SG90
  delay(100); // Wait for PWM to stabilize
  myservo.write(0); // Set initial position
  delay(500); // Allow servo to settle
  myservo.write(0); // Reinforce initial position
  publishLog("Servo initialized to 0 degrees");

  // Setup LED (no flash)
  pinMode(ledPin, OUTPUT);
  digitalWrite(ledPin, LOW);

  // Setup button
  pinMode(buttonPin, INPUT_PULLUP);

  // Connect to WiFi
  WiFi.begin(ssid, password);
  WiFi.setSleep(false);
  Serial.print("WiFi connecting");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi connected");
  Serial.println("IP Address: " + WiFi.localIP().toString());

  // MQTT Setup
  mqttClient.setServer(mqtt_server, 1883);
  while (!mqttClient.connected()) {
    if (mqttClient.connect("ESP32Client")) {
      publishLog("MQTT connected.");
    } else {
      Serial.print("MQTT connection failed. Retry...");
      delay(1000);
    }
  }

  // Camera setup
  setupCamera();
  publishLog("Setup complete. Waiting for button press...");
}

String recognizeLicensePlate(camera_fb_t* fb) {
  if (WiFi.status() != WL_CONNECTED) {
    publishLog("WiFi not connected. Attempting to reconnect...");
    WiFi.reconnect();
    delay(2000);
    if (WiFi.status() != WL_CONNECTED) {
      publishLog("WiFi reconnection failed.");
      return "";
    }
  }

  HTTPClient http;
  WiFiClient client;

  if (!http.begin(client, flaskServer)) {
    publishLog("Failed to connect to Flask server: " + String(flaskServer));
    return "";
  }

  String boundary = "----WebKitFormBoundary7MA4YWxkTrZu0gW";
  String head = "--" + boundary + "\r\nContent-Disposition: form-data; name=\"image\"; filename=\"cam.jpg\"\r\nContent-Type: image/jpeg\r\n\r\n";
  String tail = "\r\n--" + boundary + "--\r\n";

  http.addHeader("Content-Type", "multipart/form-data; boundary=" + boundary);

  String body = head;
  body += String((char*)fb->buf, fb->len);
  body += tail;

  publishLog("Sending image to Flask server...");
  int httpCode = http.POST(body);

  String plateNumber = "";
  if (httpCode > 0) {
    String response = http.getString();
    publishLog("HTTP Response Code: " + String(httpCode));
    publishLog("Full Server Response: " + response);

    int jsonStart = response.indexOf("{");
    if (jsonStart != -1) {
      String jsonResponse = response.substring(jsonStart);
      DynamicJsonDocument doc(512);
      DeserializationError error = deserializeJson(doc, jsonResponse);
      if (error) {
        publishLog("JSON parsing failed: " + String(error.c_str()));
      } else {
        if (doc.containsKey("plate_number")) {
          plateNumber = doc["plate_number"].as<String>();
          publishLog("Detected License Plate: " + plateNumber);
        } else if (doc.containsKey("error")) {
          publishLog("Server Error: " + doc["error"].as<String>());
        } else {
          publishLog("Unknown JSON structure received");
        }
      }
    } else {
      publishLog("No JSON response received");
    }
  } else {
    publishLog("HTTP POST failed: " + http.errorToString(httpCode));
  }

  http.end();
  client.stop();
  return plateNumber;
}

bool checkReservation(String plateNumber) {
  if (plateNumber.isEmpty()) {
    publishLog("No plate number to check.");
    return false;
  }

  WiFiClient client;
  HTTPClient http;
  String url = "http://" + String(backendServer) + ":" + backendPort + checkPlateEndpoint;

  if (!http.begin(client, url)) {
    publishLog("HTTP begin failed for reservation check.");
    return false;
  }

  http.addHeader("Content-Type", "application/json");
  DynamicJsonDocument doc(200);
  doc["immatriculation"] = plateNumber;
  String payload;
  serializeJson(doc, payload);

  publishLog("Checking reservation for plate: " + plateNumber);
  int httpCode = http.POST(payload);
  if (httpCode > 0) {
    String response = http.getString();
    DynamicJsonDocument resDoc(1024);
    DeserializationError error = deserializeJson(resDoc, response);
    if (error) {
      publishLog("Reservation response JSON parsing failed: " + String(error.c_str()));
      http.end();
      return false;
    }
    bool authorized = resDoc["authorized"];
    publishLog("Backend response: " + String(authorized ? "Authorized" : "Denied"));
    http.end();
    return authorized;
  } else {
    publishLog("HTTP error for reservation check: " + http.errorToString(httpCode));
    http.end();
    return false;
  }
}

void loop() {
  mqttClient.loop();

  if (digitalRead(buttonPin) == LOW) {
    if (!buttonPressed) {
      buttonPressed = true;
      publishLog("Button pressed - Activating camera");

      // Check available heap memory
      uint32_t freeHeap = ESP.getFreeHeap();
      publishLog("Free heap before capture: " + String(freeHeap) + " bytes");

      camera_fb_t* fb = esp_camera_fb_get();
      if (!fb) {
        publishLog("Camera capture failed. Error: " + String(esp_err_to_name(ESP_FAIL)));
        sensor_t *s = esp_camera_sensor_get();
        if (s) {
          s->set_framesize(s, FRAMESIZE_QVGA);
          publishLog("Retrying with FRAMESIZE_QVGA");
          fb = esp_camera_fb_get();
          if (!fb) {
            publishLog("Retry failed. Resetting camera...");
            resetCamera();
          } else {
            publishLog("Retry succeeded. Image captured. Size: " + String(fb->len) + " bytes");
          }
        }
      } else {
        publishLog("Image captured. Size: " + String(fb->len) + " bytes");
      }

      if (fb) {
        String plateNumber = recognizeLicensePlate(fb);

        if (plateNumber.length() > 0) {
          bool hasReservation = checkReservation(plateNumber);
          if (hasReservation) {
            publishLog("Access granted for: " + plateNumber);
            myservo.write(90); // Open gate
            delay(3000);
            myservo.write(0); // Close gate
            delay(500); // Allow servo to settle
            myservo.detach(); // Detach to prevent jitter
            myservo.attach(servoPin, 600, 2400); // Reattach for next use
            myservo.write(0); // Reinforce position
            publishLog("Gate closed");
          } else {
            publishLog("Access denied for: " + plateNumber);
            for (int i = 0; i < 3; i++) {
              digitalWrite(ledPin, HIGH); delay(200);
              digitalWrite(ledPin, LOW); delay(200);
            }
          }
        } else {
          publishLog("No plate detected.");
        }

        esp_camera_fb_return(fb);
      }

      resetCamera();
      buttonPressed = false;
    }
  } else {
    buttonPressed = false;
  }

  delay(100);
}