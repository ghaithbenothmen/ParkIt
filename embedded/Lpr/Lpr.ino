#include <Arduino.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include "esp_camera.h"
#include "soc/soc.h"
#include "soc/rtc_cntl_reg.h"
#include <WiFiClientSecure.h>

// ====== WiFi Configuration ======
const char* ssid = "Galaxy";
const char* password = "00000000";

// ====== Plate Recognition Service Configuration ======
const char* plateRecognitionServer = "www.circuitdigest.cloud";
const String plateRecognitionPath = "/readnumberplate";
const int plateRecognitionPort = 443;
const String plateRecognitionApiKey = "ORAc4MSX9TOw";

// ====== Your Local Backend Configuration ======
const char* backendServer = "192.168.34.25"; // Your PC's IP
const int backendPort = 4000;
const String checkPlateEndpoint = "/api/lpr/check-vehicle";

// ====== LED Pin Configuration ======
const int ledPin = 4; // GPIO pin for the LED

// ====== Camera Pin Configuration ======
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

void setup() {
  WRITE_PERI_REG(RTC_CNTL_BROWN_OUT_REG, 0);  // Disable brownout detector
  Serial.begin(115200);
  delay(1000);

  // Initialize LED pin
  pinMode(ledPin, OUTPUT);
  digitalWrite(ledPin, LOW);

  Serial.println("Connecting to WiFi...");
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    Serial.print(".");
    delay(500);
  }
  Serial.println("\nWiFi connected!");
  Serial.print("IP: ");
  Serial.println(WiFi.localIP());

  // ====== Camera Configuration ======
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
  } else {
    config.frame_size = FRAMESIZE_CIF;
    config.jpeg_quality = 12;
    config.fb_count = 1;
  }

  esp_err_t err = esp_camera_init(&config);
  if (err != ESP_OK) {
    Serial.printf("Camera init failed: 0x%x\n", err);
    ESP.restart();
  }
  // Add network diagnostics
  Serial.println("\nNetwork Information:");
  Serial.print("IP Address: ");
  Serial.println(WiFi.localIP());
  Serial.print("Subnet Mask: ");
  Serial.println(WiFi.subnetMask());
  Serial.print("Gateway: ");
  Serial.println(WiFi.gatewayIP());
  Serial.print("DNS: ");
  Serial.println(WiFi.dnsIP());
  
  Serial.println("Setup complete!");
}

// Helper function to extract JSON values
String extractJsonStringValue(const String& jsonString, const String& key) {
  int keyIndex = jsonString.indexOf(key);
  if (keyIndex == -1) return "";
  int startIndex = jsonString.indexOf(':', keyIndex) + 2;
  int endIndex = jsonString.indexOf('"', startIndex);
  if (startIndex == -1 || endIndex == -1) return "";
  return jsonString.substring(startIndex, endIndex);
}

// Function to recognize license plate from image
String recognizeLicensePlate(camera_fb_t* fb) {
  WiFiClientSecure client;
  client.setInsecure(); // Skip SSL verification for simplicity
  
  if (!client.connect(plateRecognitionServer, plateRecognitionPort)) {
    Serial.println("Connection to plate recognition server failed");
    return "";
  }

  String filename = plateRecognitionApiKey + ".jpeg";
  String head = "--CircuitDigest\r\nContent-Disposition: form-data; name=\"imageFile\"; filename=\"" + filename + "\"\r\nContent-Type: image/jpeg\r\n\r\n";
  String tail = "\r\n--CircuitDigest--\r\n";
  uint32_t imageLen = fb->len;
  uint32_t totalLen = imageLen + head.length() + tail.length();

  client.println("POST " + plateRecognitionPath + " HTTP/1.1");
  client.println("Host: " + String(plateRecognitionServer));
  client.println("Content-Length: " + String(totalLen));
  client.println("Content-Type: multipart/form-data; boundary=CircuitDigest");
  client.println("Authorization: " + plateRecognitionApiKey);
  client.println();
  client.print(head);

  uint8_t* fbBuf = fb->buf;
  size_t fbLen = fb->len;
  for (size_t n = 0; n < fbLen; n += 1024) {
    size_t chunkSize = (n + 1024 < fbLen) ? 1024 : fbLen - n;
    client.write(fbBuf + n, chunkSize);
  }
  client.print(tail);

  Serial.println("Image sent for plate recognition...");
  String response;
  long startTime = millis();
  while (client.connected() && millis() - startTime < 10000) {
    while (client.available()) {
      response += char(client.read());
    }
  }
  client.stop();

  String plate = extractJsonStringValue(response, "\"number_plate\"");
  Serial.println("Detected Plate: " + plate);
  return plate;
}

// Function to check plate with your backend
bool checkReservation(String plateNumber) {
  if (plateNumber.length() == 0) return false;

  // Use separate client instance
  WiFiClient client;
  HTTPClient http;
  
  String url = "http://" + String(backendServer) + ":" + String(backendPort) + checkPlateEndpoint;
  
  Serial.println("Attempting connection to: " + url);
  
  // Test basic connection first
  if (!client.connect(backendServer, backendPort)) {
    Serial.println("Direct TCP connection failed");
    return false;
  }
  client.stop();

  // Initialize HTTP client
  if (!http.begin(client, url)) {
    Serial.println("HTTP begin failed");
    return false;
  }

  http.addHeader("Content-Type", "application/json");
  
  // Create payload
  DynamicJsonDocument doc(200);
  doc["immatriculation"] = plateNumber;
  String payload;
  serializeJson(doc, payload);
  
  Serial.println("Sending: " + payload);
  
  int httpCode = http.POST(payload);
  
  if (httpCode > 0) {
    Serial.printf("HTTP code: %d\n", httpCode);
    String response = http.getString();
    Serial.println("Response: " + response);
    
    DynamicJsonDocument resDoc(1024);
    DeserializationError err = deserializeJson(resDoc, response);
    if (err) {
      Serial.print("JSON error: ");
      Serial.println(err.c_str());
      http.end();
      return false;
    }
    
    bool authorized = resDoc["authorized"];
    http.end();
    return authorized;
  } else {
    Serial.printf("HTTP error: %s\n", http.errorToString(httpCode).c_str());
    http.end();
    return false;
  }
}


void loop() {
  delay(10000); // Wait 10 seconds between captures

  Serial.println("Capturing photo...");
  camera_fb_t* fb = esp_camera_fb_get();

  if (!fb) {
    Serial.println("Camera capture failed");
    return;
  }

  // Step 1: Recognize license plate
  String plateNumber = recognizeLicensePlate(fb);
  
  if (plateNumber.length() > 0) {
    // Step 2: Check reservation with backend
    bool hasReservation = checkReservation(plateNumber);
    
    if (hasReservation) {
      Serial.println("Vehicle has a reservation - access granted");
      digitalWrite(ledPin, HIGH); // Turn on LED
      delay(5000); // Keep LED on for 5 seconds
      digitalWrite(ledPin, LOW); // Turn off LED
    } else {
      Serial.println("No reservation found - access denied");
      // Optional: Different LED pattern for denied access
      for (int i = 0; i < 3; i++) {
        digitalWrite(ledPin, HIGH);
        delay(200);
        digitalWrite(ledPin, LOW);
        delay(200);
      }
    }
  } else {
    Serial.println("No plate detected");
    digitalWrite(ledPin, LOW);
  }

  esp_camera_fb_return(fb);
}