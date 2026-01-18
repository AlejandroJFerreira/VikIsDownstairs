package org.example.passwordapi;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;

@RestController
@RequestMapping("/api/wordpass")
public class PasswordGetAPI {

    @GetMapping("/{site}")
    public ResponseEntity<String> getPassword(@PathVariable String site) {
        String data = getStoredDataForSite(site);
        return ResponseEntity.ok(data);
    }

//    @GetMapping("/all")
//    public ResponseEntity<String> getAllPasswords() {
//        String data = getAllStoredData();
//        return ResponseEntity.ok(data);
//    }

    // Method to get data for a specific site
    public String getStoredDataForSite(String site) {
        try {
            // Add site as a query parameter (adjust based on your server API)
            URL url = new URL("http://10.224.149.15:5000/store?site=" + site);
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("GET");
            conn.setRequestProperty("Accept", "application/json");

            int responseCode = conn.getResponseCode();
            System.out.println("GET Response Code: " + responseCode);

            if (responseCode == HttpURLConnection.HTTP_OK) {
                BufferedReader in = new BufferedReader(
                        new InputStreamReader(conn.getInputStream()));
                String inputLine;
                StringBuilder response = new StringBuilder();

                while ((inputLine = in.readLine()) != null) {
                    response.append(inputLine);
                }
                in.close();

                String jsonResponse = response.toString();
                System.out.println("Received data: " + jsonResponse);
                return jsonResponse;
            } else {
                // Read error stream for more details
                try (BufferedReader errorReader = new BufferedReader(
                        new InputStreamReader(conn.getErrorStream()))) {
                    StringBuilder errorResponse = new StringBuilder();
                    String errorLine;
                    while ((errorLine = errorReader.readLine()) != null) {
                        errorResponse.append(errorLine);
                    }
                    return "GET request failed: " + responseCode + " - " + errorResponse.toString();
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
            return "Error reading data from server: " + e.getMessage();
        }
    }

    // Method to get all data
    public String getAllStoredData() {
        try {
            URL url = new URL("http://10.224.149.15:5000/store");
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("GET");
            conn.setRequestProperty("Accept", "application/json");

            int responseCode = conn.getResponseCode();
            System.out.println("GET Response Code: " + responseCode);

            if (responseCode == HttpURLConnection.HTTP_OK) {
                BufferedReader in = new BufferedReader(
                        new InputStreamReader(conn.getInputStream()));
                String inputLine;
                StringBuilder response = new StringBuilder();

                while ((inputLine = in.readLine()) != null) {
                    response.append(inputLine);
                }
                in.close();

                String jsonResponse = response.toString();
                System.out.println("Received all data: " + jsonResponse);
                return jsonResponse;
            } else {
                return "GET request failed with response code: " + responseCode;
            }
        } catch (Exception e) {
            e.printStackTrace();
            return "Error reading data from server!";
        }
    }
}