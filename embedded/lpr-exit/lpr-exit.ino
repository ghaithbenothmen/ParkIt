#include <Arduino.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include "esp_camera.h"
#include "soc/soc.h"
#include "soc/rtc_cntl_reg.h"
#include <WiFiClientSecure.h>
#include <PubSubClient.h>
#include <ESP32Servo.h>
#include <NTPClient.h>
#include <WiFiUdp.h>

// === Servo Configuration ===
Servo myservo;
const int servoPin = 14;

// === Bouton Config ===
const int buttonPin = 12;
bool buttonPressed = false;

// === WiFi Config ===
const char* ssid = "Galaxy";
const char* password = "00000000";

// === MQTT Config ===
const char* mqtt_server = "192.168.134.25";
WiFiClient wifiClient;
PubSubClient mqttClient(wifiClient);

// === NTP Config ===
WiFiUDP ntpUDP;
NTPClient timeClient(ntpUDP, "pool.ntp.org");

// === Plate Recognition Config ===
const char* plateRecognitionServer = "www.circuitdigest.cloud";
const String plateRecognitionPath = "/readnumberplate";
const int plateRecognitionPort = 443;
const String plateRecognitionApiKey = "rI5LddJ5QRpC";

// === Backend Config ===
const char* backendServer = "192.168.134.25";
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

WiFiClientSecure client;

// === MQTT Log Helper ===
String getTimestamp() {
  timeClient.update();
  return timeClient.getFormattedTime();
}

void publishLog(String message) {
  String timestamp = getTimestamp();
  String fullMessage = "[" + timestamp + "] " + message;
  mqttClient.publish("lpr/exit/logs", fullMessage.c_str());
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
    config.frame_size = FRAMESIZE_SVGA;
    config.jpeg_quality = 10;
    config.fb_count = 2;
    config.grab_mode = CAMERA_GRAB_LATEST;
  } else {
    config.frame_size = FRAMESIZE_CIF;
    config.jpeg_quality = 12;
    config.fb_count = 1;
  }
  
  esp_err_t err = esp_camera_init(&config);
  if (err != ESP_OK) {
    publishLog("Camera init failed.");
    ESP.restart();
  }

  sensor_t *s = esp_camera_sensor_get();
  s->set_vflip(s, 1);
  s->set_hmirror(s, 1);
  s->set_framesize(s, FRAMESIZE_QVGA);
  
  publishLog("Camera setup complete.");
}

void resetCamera() {
  esp_camera_deinit();
  delay(100);
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
  myservo.write(90);
  
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
  Serial.println(WiFi.localIP());
  
  // Initialize NTP
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

String extractJsonStringValue(const String& jsonString, const String& key) {
  int keyIndex = jsonString.indexOf(key);
  if (keyIndex == -1) return "";
  int startIndex = jsonString.indexOf(':', keyIndex) + 2;
  int endIndex = jsonString.indexOf('"', startIndex);
  return jsonString.substring(startIndex, endIndex);
}

String recognizeLicensePlate(camera_fb_t* fb) {
  client.setInsecure();
  if (!client.connect(plateRecognitionServer, plateRecognitionPort)) {
    publishLog("Plate recognition connection failed.");
    return "";
  }

  String head = "--CircuitDigest\r\nContent-Disposition: form-data; name=\"imageFile\"; filename=\"" + plateRecognitionApiKey + ".jpeg\"\r\nContent-Type: image/jpeg\r\n\r\n";
  String tail = "\r\n--CircuitDigest--\r\n";
  uint32_t totalLen = fb->len + head.length() + tail.length();

  client.println("POST " + plateRecognitionPath + " HTTP/1.1");
  client.println("Host: " + String(plateRecognitionServer));
  client.println("Content-Length: " + String(totalLen));
  client.println("Content-Type: multipart/form-data; boundary=CircuitDigest");
  client.println("Authorization: " + plateRecognitionApiKey);
  client.println();
  client.print(head);

  for (size_t n = 0; n < fb->len; n += 1024) {
    client.write(fb->buf + n, std::min((size_t)1024, fb->len - n));
  }
  client.print(tail);

  publishLog("Image sent for recognition.");
  String response;
  long startTime = millis();
  while (client.connected() && millis() - startTime < 10000) {
    while (client.available()) {
      response += char(client.read());
    }
  }
  client.stop();

  String plate = extractJsonStringValue(response, "\"number_plate\"");
  publishLog("Detected Plate: " + plate);
  return plate;
}

bool checkExitConditions(String plateNumber) {
  if (plateNumber.isEmpty()) return false;

  WiFiClient client;
  HTTPClient http;
  String url = "http://" + String(backendServer) + ":" + backendPort + checkExitPlateEndpoint;

  if (!http.begin(client, url)) {
    publishLog("HTTP begin failed.");
    return false;
  }

  http.addHeader("Content-Type", "application/json");
  DynamicJsonDocument doc(200);
  doc["immatriculation"] = plateNumber;
  String payload;
  serializeJson(doc, payload);

  int httpCode = http.POST(payload);
  if (httpCode > 0) {
    String response = http.getString();
    DynamicJsonDocument resDoc(1024);
    deserializeJson(resDoc, response);
    
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
      publishLog("Overstay: " + String(overstayHours) + "h (" + String(overstayMinutes) + "m)");
      publishLog("Additional Fee: " + String(additionalFee) + " DT");
    }
    
    if (needsPayment) {
      publishLog("=== PAYMENT REQUIRED ===");
      publishLog("Please make payment of " + String(additionalFee) + " DT to exit");
      publishLog("=====================");
      
      // Blink payment LED
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
    publishLog("HTTP error: " + http.errorToString(httpCode));
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
      digitalWrite(ledPin, HIGH);
      
      camera_fb_t* fb = esp_camera_fb_get();
      if (!fb) {
        publishLog("Camera capture failed.");
        publishLog("=====================");
        buttonPressed = false;
        digitalWrite(ledPin, LOW);
        return;
      }

      String plateNumber = recognizeLicensePlate(fb);
      
      if (plateNumber.length() > 0) {
        bool canExit = checkExitConditions(plateNumber);
        if (canExit) {
          publishLog("Opening gate for: " + plateNumber);
          myservo.write(0);
          delay(3000);
          myservo.write(90);
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

      digitalWrite(ledPin, LOW);
      esp_camera_fb_return(fb);
      resetCamera();
      buttonPressed = false;
    }
  } else {
    buttonPressed = false;
  }
  
  delay(100);
} 