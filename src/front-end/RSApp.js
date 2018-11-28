/**

 RSApp.js
 Author: Jon Thomas
 Class: CSC-337 Fall 2018
 Instructor: Allison Obourn

 Front-end JavaScript for RSApp.html.  Handles collecting user input,
 sends data to Node.js back-end code for security, encryption, decryption, etc.

 **/

"use strict";

(function () {

    window.onload = function () {

        document.getElementById("getPrimeA").onclick = generateForAlice;
        document.getElementById("getPrimeB").onclick = generateForBob;

        document.getElementById("makeKeyA").onclick = makeAliceKey;
        document.getElementById("makeKeyB").onclick = makeBobKey;

        document.getElementById("aliceEnc").onclick = encryptAlice;
        document.getElementById("bobEnc").onclick = encryptBob;

        document.getElementById("aliceDec").onclick = decryptAlice;
        document.getElementById("bobDec").onclick = decryptBob;

        document.getElementById("aliceSend").onclick = sendAlice;
        document.getElementById("bobSend").onclick = sendBob;

        document.getElementById("evePublicA").onclick = getAliceKey;
        document.getElementById("evePublicB").onclick = getBobKey;

        document.getElementById("getAlice").onclick = crackAlice;
        document.getElementById("getBob").onclick = crackBob;

        document.getElementById("eveCrack").onclick = eveCrack;

    };

    /**
     * generateForAlice
     * Calls generatePrimes to generate key values for Alice
     */
    function generateForAlice() {
        alert("Generate for Alice");
        // TODO add values to Alice's Boxes
    }

    /**
     * generateForBob
     * Calls generatePrimes to generate key values for Alice
     */
    function generateForBob() {
        alert("Generate for Bob");
        // TODO add values to Bob's Boxes
    }

    /**
     * generatePrimes
     * Generates and returns three values:
     * 1. A prime number p
     * 2. A prime number q
     * 3. A number e such that e is relatively prime to (p-1)(q-1)
     */
    function generatePrimes() {
        // TODO write generate function
    }

    /**
     * makeAliceKey
     * Use values in the p,q, and e boxes to generate Alice's public key
     */
    function makeAliceKey() {
        alert("Make Alice's Key");
        // TODO write Alice's keygen function
    }

    /**
     * makeBobKey
     * Use values in the p,q, and e boxes to generate Alice's public key
     */
    function makeBobKey() {
        alert("Make Bob's Key");
        // TODO write Bob's keygen function
    }

    /**
     * keygen
     * using input values passed in, generate the public/private key pair
     * @param p prime number
     * @param q prime number
     * @param e random exponent
     */
    function keygen(p, q, e) {
        // TODO write keygen function
    }

    /**
     * encryptAlice
     * encrypt the message residing in Alice's message box with Bob's public key
     */
    function encryptAlice() {
        alert("Encrypt Alice's message");
    }

    /**
     * encryptBob
     * encrypt the message residing in Bob's message box with Alice's public
     * key.
     */
    function encryptBob() {
        alert("Encrypt Bob's message");
    }

    /**
     * encrypt
     * Given a message consisting of lowercase ASCII characters and spaces,
     * convert that message to a numeric encryption using the provided key.
     * @param message the message to encrypt
     * @param key the key to encrypt with
     */
    function encrypt(message, key) {

    }

    /**
     * decryptAlice
     * Use's Alice's private key to decrypt the value in Alice's message box.
     */
    function decryptAlice() {
        alert("Decrypt for Alice");
    }

    /**
     * decryptBob
     * Use's Bob's private key to decrypt the value in Bob's message box.
     */
    function decryptBob() {
        alert("Decrypt for Bob");
    }

    /**
     * decrypt
     * Given a message (represented numerically), use the provided key to
     * decrypt that message and return the ASCII representation of it back.
     * @param message the message to decrypt
     * @param key the key to decrypt with
     */
    function decrypt(message, key) {

    }

    /**
     * sendAlice
     * send the message in Alice's messagebox to Bob's messagebox.  Eve will
     * intercept the message.
     */
    function sendAlice() {
        alert("Send from Alice to Bob");
    }

    /**
     * sendBob
     * send the message in Alice's messagebox to Bob's messagebox.  Eve will
     * intercept the message.
     */
    function sendBob() {
        alert("Send from Bob to Alice");
    }

    /**
     * eveIntercept
     * Sent by either Alice or Bob, the message being intercepted by Eve.
     * Eve will add the message to her list of intercepted messages, waiting
     * to intercept.
     * @param message the message intercepted
     * @param to the messages intended target
     */
    function eveIntercept(message, to) {

    }

    /**
     * getAliceKey
     * Get Alice's public key for Eve
     */
    function getAliceKey() {
        alert("Get Alice's Key")
    }

    /**
     * getBobKey
     * Get Bob's public key for Eve
     */
    function getBobKey() {
        alert("Get Bob's Key");
    }

    /**
     * getKey
     * Return the public key from the requested target
     * @param target
     */
    function getKey(target) {
        // TODO get key from requested val
    }

    /**
     * crackAlice
     * Try to brute force cracking Alice's private key by factoring n.
     */
    function crackAlice() {
        alert("Crack Alice's Key");
    }

    /**
     * crackBob
     * Try to brute force cracking Bob's private key by factoring n.
     */
    function crackBob() {
        alert("Crack Bob's Key");
    }

    /**
     * crack
     * Given a public key, try to determine the corresponding private key.
     * @param n the number to factor
     * @param e the public key's exponent
     */
    function crack(n, e) {

    }

    /**
     * eveCrack
     * iterate through Eve's message list and decrypt all messages for which
     * the corresponding private key is known.
     */
    function eveCrack() {
        alert("Decrypt all messages")
    }

})();