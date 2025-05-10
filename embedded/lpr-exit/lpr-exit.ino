#include <Arduino.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include "esp_camera.h"
#include "soc/soc.h"
#include "soc/rtc_cntl_reg.h"
#include <PubSubClient.h>
#include <ESP32Servo.h>
#include <NTPClient.h>
#include <WiFiUdp.h>

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

// === NTP Config ===
WiFiUDP ntpUDP;
NTPClient timeClient(ntpUDP, "pool.ntp.org");

// === Flask Server Config ===
const char* flaskServer = "http://192.168.155.25:5000/api/lpr";

// === Backend Config ===
const char* backendServer = "192.168.155.25";
const int backendPort = 4000;
const String checkExitPlateEndpoint = "/api/lpr/check-exit-vehicle";

// === LED Config ===
const int ledPin = 4;
const int paymentLedPin = 2;

// === Camera Pins ===
#define PWDN_GPIO_NUM     32
#define RESET_GPIO_NUM    -1
#define XCLK_GPIO_NUM     0
#define SIOD_GPIO_NUM     26
#define SIOC_GPIO_NUM     27
#define Y9_GPIO_NUM       35
#define Y8_GPIO_NUM       34
#define Y7_GPIO_NUM       39
#define Y6_GPIO_NUM       36
#define Y5_GPIO_NUM       21
#define Y4_GPIO_NUM       19
#define Y3_GPIO_NUM       18
#define Y2_GPIO_NUM       5
#define VSYNC_GPIO_NUM    25
#define HREF_GPIO_NUM     23
#define PCLK_GPIO_NUM     22

String getTimestamp() {
  timeClient.update();
  return timeClient.getFormattedTime();
}

void publishLog(String message) {
  String timestamp = getTimestamp();
  String fullMessage = "[" + timestamp + "] " + message;
  if (mqttClient.connected()) {
    mqttClient.publish("lpr/exit/logs", fullMessage.c_str());
  }
  Serial.println(fullMessage);
}

void setupCamera() {
  camera_config_t config;
  config.ledc_channel = LEDC_CHANNEL_0;
  config.ledc_timer = LEDC_TIMER_0;
  config.pin_d0 = Y2_GPIO_NUM;
  config.pin_d1 = Y3_GPIO_NUM;
  config.pin_d2 = Y4_GPIO_NUM;
  config.pin_d3 = Y5_GPIO_NUM;
  config.pin_d4 = Y6_GPIO_NUM; // Corrected
  config.pin_d5 = Y7_GPIO_NUM; // Corrected
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
    config.frame_size = FRAMESIZE_SVGA; // 800x600
    config.jpeg_quality = 8; // Less compression
    config.fb_count = 2;
    config.grab_mode = CAMERA_GRAB_LATEST;
  } else {
    config.frame_size = FRAMESIZE_CIF;
    config.jpeg_quality = 12;
    config.fb_count = 1;
  }

  esp_err_t err = esp_camera_init(&config);
  if (err != ESP_OK) {
    publishLog("Camera init failed with error 0x" + String(err, HEX));
    ESP.restart();
  }

  sensor_t *s = esp_camera_sensor_get();
  s->set_vflip(s, 1);
  s->set_hmirror(s, 1);
  s->set_framesize(s, FRAMESIZE_SVGA);
  s->set_brightness(s, 1);
  s->set_contrast(s, 1);
  s->set_saturation(s, 0);
  s->set_sharpness(s, 1);
  s->set_whitebal(s, 0);
  s->set_awb_gain(s, 0);
  s->set_exposure_ctrl(s, 0);
  s->set_aec_value(s, 300);

  publishLog("Camera setup complete.");
}

void resetCamera() {
  esp_camera_deinit();
  delay(200); // Increased for stability
  setupCamera();
  publishLog("Camera reinitialized");
}

void setup() {
  WRITE_PERI_REG(RTC_CNTL_BROWN_OUT_REG, 0);
  Serial.begin(115200);
  Serial.setDebugOutput(true);
  Serial.println();

  ESP32PWM::allocateTimer(0);
  myservo.setPeriodHertz(50);
  myservo.attach(servoPin, 500, 2400);
  myservo.write(180); // Set initial position to 180 degrees

  pinMode(ledPin, OUTPUT);
  pinMode(paymentLedPin, OUTPUT);
  digitalWrite(ledPin, LOW);
  digitalWrite(paymentLedPin, LOW);

  pinMode(buttonPin, INPUT_PULLUP);

  WiFi.begin(ssid, password);
  WiFi.setSleep(false);
  Serial.print("WiFi connecting");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi connected");
  Serial.println("IP Address: " + WiFi.localIP().toString());

  timeClient.begin();
  timeClient.setTimeOffset(0);

  mqttClient.setServer(mqtt_server, 1883);
  while (!mqttClient.connected()) {
    if (mqttClient.connect("ESP32ExitClient")) {
      publishLog("MQTT connected.");
    } else {
      Serial.print("MQTT connection failed. Retry...");
      delay(1000);
    }
  }

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

bool checkExitConditions(String plateNumber) {
  if (plateNumber.isEmpty()) {
    publishLog("No plate number to check.");
    return false;
  }

  WiFiClient client;
  HTTPClient http;
  String url = "http://" + String(backendServer) + ":" + backendPort + checkExitPlateEndpoint;

  if (!http.begin(client, url)) {
    publishLog("HTTP begin failed for exit check.");
    return false;
  }

  http.addHeader("Content-Type", "application/json");
  DynamicJsonDocument doc(200);
  doc["immatriculation"] = plateNumber;
  String payload;
  serializeJson(doc, payload);

  publishLog("Checking exit conditions for plate: " + plateNumber);
  int httpCode = http.POST(payload);
  if (httpCode > 0) {
    String response = http.getString();
    DynamicJsonDocument resDoc(1024);
    DeserializationError error = deserializeJson(resDoc, response);
    if (error) {
      publishLog("Exit response JSON parsing failed: " + String(error.c_str()));
      http.end();
      return false;
    }

    bool authorized = resDoc["authorized"];
    bool needsPayment = resDoc["overstayDetails"]["needsPayment"];
    float additionalFee = resDoc["overstayDetails"]["additionalFee"];
    float hourlyRate = resDoc["reservationDetails"]["hourlyRate"];
    int overstayHours = resDoc["overstayDetails"]["hours"];
    int overstayMinutes = resDoc["overstayDetails"]["minutes"];
    String startTime = resDoc["reservationDetails"]["startTime"].as<String>();
    String endTime = resDoc["reservationDetails"]["endTime"].as<String>();
    String currentTime = resDoc["reservationDetails"]["currentTime"].as<String>();
    String vehicleMake = resDoc["reservationDetails"]["vehicle"]["marque"].as<String>();
    String vehicleModel = resDoc["reservationDetails"]["vehicle"]["modele"].as<String>();

    publishLog("=== EXIT CHECK DETAILS ===");
    publishLog("Vehicle: " + vehicleMake + " " + vehicleModel + " (" + plateNumber + ")");
    publishLog("Reservation Period: " + startTime + " - " + endTime);
    publishLog("Current Time: " + currentTime);
    publishLog("Parking Rate: " + String(hourlyRate) + " DT/hour");

    if (overstayHours > 0 || overstayMinutes > 0) {
      publishLog("Overstay: " + String(overstayHours) + "h " + String(overstayMinutes) + "m");
      publishLog("Additional Fee: " + String(additionalFee) + " DT");
    }

    if (needsPayment) {
      publishLog("=== PAYMENT REQUIRED ===");
      publishLog("Please make payment of " + String(additionalFee) + " DT to exit");
      publishLog("=====================");
      for (int i = 0; i < 5; i++) {
        digitalWrite(paymentLedPin, HIGH);
        delay(200);
        digitalWrite(paymentLedPin, LOW);
        delay(200);
      }
    } else {
      if (additionalFee > 0) {
        publishLog("=== EXIT AUTHORIZED ===");
        publishLog("Additional fees (" + String(additionalFee) + " DT) already paid");
        publishLog("Gate will open shortly");
        publishLog("=====================");
      } else {
        publishLog("=== EXIT AUTHORIZED ===");
        publishLog("No additional fees required");
        publishLog("Gate will open shortly");
        publishLog("=====================");
      }
    }

    http.end();
    return authorized;
  } else {
    publishLog("HTTP error for exit check: " + http.errorToString(httpCode));
    http.end();
    return false;
  }
}

void loop() {
  mqttClient.loop();
  timeClient.update();

  if (digitalRead(buttonPin) == LOW) {
    if (!buttonPressed) {
      buttonPressed = true;
      publishLog("=== NEW EXIT REQUEST ===");
      publishLog("Button pressed - Activating camera");
      
      uint32_t freeHeap = ESP.getFreeHeap();
      publishLog("Free heap before capture: " + String(freeHeap) + " bytes");

      camera_fb_t* fb = esp_camera_fb_get();
      if (!fb) {
        publishLog("Camera capture failed. Error: " + String(esp_err_to_name(ESP_FAIL)));
        publishLog("Retrying with FRAMESIZE_QVGA");
        sensor_t *s = esp_camera_sensor_get();
        if (s) {
          s->set_framesize(s, FRAMESIZE_QVGA);
          fb = esp_camera_fb_get();
          if (!fb) {
            publishLog("Retry failed. Resetting camera...");
            publishLog("=====================");
            resetCamera();
            buttonPressed = false;
            digitalWrite(ledPin, LOW);
            return;
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
          bool canExit = checkExitConditions(plateNumber);
          if (canExit) {
            publishLog("Opening gate for: " + plateNumber);
            myservo.write(90); // Open gate to 90 degrees
            delay(3000);
            myservo.write(180); // Close gate back to 180 degrees
            delay(500); // Allow servo to settle
            myservo.detach(); // Detach to prevent jitter
delay(500); // Allow detachment to stabilize
            myservo.attach(servoPin, 500, 2400); // Reattach for next use
            myservo.write(180); // Reinforce initial position
            publishLog("Gate closed");
          } else {
            publishLog("=== EXIT DENIED ===");
            publishLog("Vehicle: " + plateNumber);
            publishLog("Please complete payment to exit");
            publishLog("=====================");
            for (int i = 0; i < 3; i++) {
              digitalWrite(ledPin, HIGH);
              delay(200);
              digitalWrite(ledPin, LOW);
              delay(200);
            }
          }
        } else {
          publishLog("=== ERROR ===");
          publishLog("No license plate detected");
          publishLog("Please try again");
          publishLog("=====================");
        }

        esp_camera_fb_return(fb);
      }

      digitalWrite(ledPin, LOW);
      resetCamera();
      buttonPressed = false;
    }
  } else {
    buttonPressed = false;
  }

  delay(100);
}