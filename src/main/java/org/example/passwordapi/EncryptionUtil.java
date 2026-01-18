package org.example.passwordapi;

public class EncryptionUtil {

    // Simple Caesar Cipher: shift each character by 'shift' positions
    public static String caesarEncrypt(String input, int shift) {
        StringBuilder encrypted = new StringBuilder();
        for (char c : input.toCharArray()) {
            // Only shift letters and numbers for simplicity
            if (Character.isLetterOrDigit(c)) {
                char base = Character.isUpperCase(c) ? 'A' :
                        Character.isLowerCase(c) ? 'a' : '0';
                int mod = Character.isDigit(c) ? 10 : 26;
                encrypted.append((char) ((c - base + shift) % mod + base));
            } else {
                encrypted.append(c); // keep other characters unchanged
            }
        }
        return encrypted.toString();
    }
}