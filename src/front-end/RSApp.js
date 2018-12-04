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

    let messageList;
    let bobKey = false;
    let aliceKey = false;

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

        messageList = {};
        let names = [];
        let messages = [];
        messageList.names = names;
        messageList.messages = messages;

    };

    /**
     * generateForAlice
     * Calls generatePrimes to generate key values for Alice
     */
    function generateForAlice() {
        generatePrimes("alice");
    }

    /**
     * generateForBob
     * Calls generatePrimes to generate key values for Alice
     */
    function generateForBob() {
        generatePrimes("bob");
    }

    /**
     * generatePrimes
     * Generates and returns three values:
     * 1. A prime number p
     * 2. A prime number q
     * 3. A number e such that e is relatively prime to (p-1)(q-1)
     */
    function generatePrimes(recip) {

        let url = "http://localhost:3000?msg=primes";

        fetch(url)
            .then(checkStatus)
            .then(function (responseText) {
                let json = JSON.parse(responseText);
                let p = json["P"];
                let q = json["Q"];
                let e = json["E"];

                document.getElementById(recip + "P").value = p;
                document.getElementById(recip + "Q").value = q;
                document.getElementById(recip + "E").value = e;
            })
            .catch(function (error) {
                console.log(error);
            });
    }

    /**
     * checkStatus
     * returns the response text if the status is in the 200s
     * otherwise rejects the promise with a message including the status
     */
    function checkStatus(response) {
        if (response.status >= 200 && response.status < 300) {
            return response.text();
        } else if (response.status === 404) {
            // sends back a different error when we have a 404 than when we have
            // a different error
            return Promise.reject(new Error("Sorry, we couldn't find that page"));
        } else {
            return Promise.reject(new Error(response.status + ": " + response.statusText));
        }
    }

    /**
     * makeAliceKey
     * Use values in the p,q, and e boxes to generate Alice's public key
     */
    function makeAliceKey() {
        aliceKey = false;
        let p = document.getElementById("aliceP").value;
        let q = document.getElementById("aliceQ").value;
        let e = document.getElementById("aliceE").value;
        keygen("alice", p, q, e);
    }

    /**
     * makeBobKey
     * Use values in the p,q, and e boxes to generate Alice's public key
     */
    function makeBobKey() {
        bobKey = false;
        let p = document.getElementById("bobP").value;
        let q = document.getElementById("bobQ").value;
        let e = document.getElementById("bobE").value;
        keygen("bob", p, q, e);
    }

    /**
     * keygen
     * using input values passed in, generate the public/private key pair
     * @param recip the subject the key is for
     * @param p prime number
     * @param q prime number
     * @param e random exponent
     */
    function keygen(recip, p, q, e) {
        const message = {
            request: "keygen",
            name: recip,
            P: p,
            Q: q,
            E: e
        };
        const fetchOptions = {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(message)
        };
        let url = "http://localhost:3000";
        fetch(url, fetchOptions)
            .then(checkStatus)
            .then(function (responseText) {
                let json = JSON.parse(responseText);
                let n = json["N"];
                let phi = json["PHI"];
                let e = json["E"];
                let d = json["D"];
                document.getElementById(recip + "N").innerHTML = n;
                document.getElementById(recip + "Phi").innerHTML = phi;
                document.getElementById(recip + "D").innerHTML = d;
                document.getElementById(recip + "PubKey").innerHTML =
                    "<" + e + ", " + n + ">";
                document.getElementById(recip + "PrivKey").innerHTML =
                    "<" + d + ", " + n + ">";
            })
            .catch(function (error) {
                console.log(error);
            });
    }

    /**
     * encryptAlice
     * encrypt the message residing in Alice's message box with Bob's public key
     */
    function encryptAlice() {
        let message = document.getElementById("aliceMessage").value;

        if (!validateMessage(message)) {
            alert("Invalid input.  Please use lowercase letters a-z and" +
                " spaces only.");
            return;
        }

        encrypt("bob", message);
    }

    /**
     * encryptBob
     * encrypt the message residing in Bob's message box with Alice's public
     * key.
     */
    function encryptBob() {
        let message = document.getElementById("bobMessage").value;

        if (!validateMessage(message)) {
            alert("Invalid input.  Please use lowercase letters a-z and" +
                " spaces only.");
            return;
        }

        encrypt("alice", message);
    }

    /**
     * encrypt
     * Given a message consisting of lowercase ASCII characters and spaces,
     * convert that message to a numeric encryption using the provided key.
     * @param user the owner of the private key
     * @param message the message to encrypt
     */
    function encrypt(user, message) {
        const data = {
            request: "encrypt",
            name: user,
            message: message
        };
        const fetchOptions = {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        };
        let url = "http://localhost:3000";
        fetch(url, fetchOptions)
            .then(checkStatus)
            .then(function (responseText) {
                let json = JSON.parse(responseText);
                let message = json.message;
                let printText = "";

                for (let i = 0; i < message.length; i++) {
                    printText += message[i];
                    if (i !== message.length - 1) {
                        printText += " ";
                    }
                }

                let box = "alice";
                if (user === "alice") {
                    box = "bob";
                }
                document.getElementById(box + "Message").value = printText;
            })
            .catch(function (error) {
                console.log(error);
            });
    }

    /**
     * validateIntegers
     * validate that the message consists only of integers and spaces
     * @param message input message
     * @returns {{groups: {}}|RegExpExecArray} true if validated
     */
    function validateIntegers(message) {
        let test = /^[0-9 ]{1,240}$/;
        return test.exec(message);
    }

    /**
     * decryptAlice
     * Use's Alice's private key to decrypt the value in Alice's message box.
     */
    function decryptAlice() {
        let message = document.getElementById("aliceMessage").value;

        if (!validateIntegers(message)) {
            alert("Invalid input.  Please use lowercase letters a-z and" +
                " spaces only.");
            return;
        }

        decrypt("alice", message);
    }

    /**
     * decryptBob
     * Use's Bob's private key to decrypt the value in Bob's message box.
     */
    function decryptBob() {
        let message = document.getElementById("bobMessage").value;

        if (!validateIntegers(message)) {
            alert("Invalid input.  Please use lowercase letters a-z and" +
                " spaces only.");
            return;
        }

        decrypt("bob", message);
    }

    /**
     * decrypt
     * Given a message (represented numerically), use the provided key to
     * decrypt that message and return the ASCII representation of it back.
     * @param user the holder of the decryption key
     * @param message the message to decrypt
     */
    function decrypt(user, message) {
        const data = {
            request: "decrypt",
            name: user,
            message: message
        };
        const fetchOptions = {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        };
        let url = "http://localhost:3000";
        fetch(url, fetchOptions)
            .then(checkStatus)
            .then(function (responseText) {
                let json = JSON.parse(responseText);
                document.getElementById(user + "Message").value = json.message;
            })
            .catch(function (error) {
                console.log(error);
            });
    }

    /**
     * validateMessage
     * Check that input meets message requirements.  Message must only
     * contain lower-case alphabet characters and spaces.
     * @param message
     */
    function validateMessage(message) {
        let test = /^[a-z ]{1,120}$/;
        return test.exec(message);
    }

    /**
     * sendAlice
     * send the message in Alice's messagebox to Bob's messagebox.  Eve will
     * intercept the message.
     */
    function sendAlice() {
        let message = document.getElementById("aliceMessage").value;
        document.getElementById("bobMessage").value = message;
        document.getElementById("aliceMessage").value = "";
        eveIntercept(message, "Bob");
    }

    /**
     * sendBob
     * send the message in Alice's messagebox to Bob's messagebox.  Eve will
     * intercept the message.
     */
    function sendBob() {
        let message = document.getElementById("bobMessage").value;
        document.getElementById("aliceMessage").value = message;
        document.getElementById("bobMessage").value = "";
        eveIntercept(message, "Alice");
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
        messageList.names.push(to);
        messageList.messages.push(message);

        addToTable(to, message);
    }

    /**
     * addToTable
     * Add the name and message parameters to Eve's intercepted messages table.
     * @param to the recipient of the message
     * @param message the message intercepted
     */
    function addToTable(to, message) {
        let tableRow = document.createElement("tr");
        let dataName = document.createElement("td");
        let dataMess = document.createElement("td");

        dataName.innerHTML = to;
        dataMess.innerHTML = message;

        tableRow.appendChild(dataName);
        tableRow.appendChild(dataMess);
        let table = document.getElementById("eveTable");
        table.appendChild(tableRow);
    }

    /**
     * getAliceKey
     * Get Alice's public key for Eve
     */
    function getAliceKey() {
        let url = "http://localhost:3000?msg=key&name=alice";

        fetch(url)
            .then(checkStatus)
            .then(function (responseText) {
                let json = JSON.parse(responseText);
                let e = json["E"];
                let n = json["N"];

                document.getElementById("eveAPub").innerHTML = e + " " + n;
            })
            .catch(function (error) {
                console.log(error);
            });
    }

    /**
     * getBobKey
     * Get Bob's public key for Eve
     */
    function getBobKey() {
        let url = "http://localhost:3000?msg=key&name=bob";

        fetch(url)
            .then(checkStatus)
            .then(function (responseText) {
                let json = JSON.parse(responseText);
                let e = json["E"];
                let n = json["N"];

                document.getElementById("eveBPub").innerHTML = e + " " + n;
            })
            .catch(function (error) {
                console.log(error);
            });
    }

    /**
     * crackAlice
     * Try to brute force cracking Alice's private key by factoring n.
     */
    function crackAlice() {
        aliceKey = true;
        let key = document.getElementById("eveAPub").innerHTML.split(" ");
        crack(key[0], key[1], "A");
    }

    /**
     * crackBob
     * Try to brute force cracking Bob's private key by factoring n.
     */
    function crackBob() {
        bobKey = true;
        let key = document.getElementById("eveBPub").innerHTML.split(" ");
        crack(key[0], key[1], "B");
    }

    /**
     * crack
     * Given a public key, try to determine the corresponding private key.
     * @param n the number to factor
     * @param e the public key's exponent
     * @param target which key is being cracked
     */
    function crack(e, n, target) {
        const data = {
            request: "crack",
            e: e,
            n: n
        };
        const fetchOptions = {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        };
        let url = "http://localhost:3000";
        fetch(url, fetchOptions)
            .then(checkStatus)
            .then(function (responseText) {
                let json = JSON.parse(responseText);

                document.getElementById("eve" + target + "Priv").innerHTML =
                    json["D"] + " " + json["N"];

                return data;
            })
            .catch(function (error) {
                console.log(error);
            });
    }

    /**
     * eveCrack
     * iterate through Eve's message list and decrypt all messages for which
     * the corresponding private key is known.
     */
    function eveCrack() {

        let keyBob = document.getElementById("eveBPriv").innerHTML.split(" ");
        let keyAlice = document.getElementById("eveAPriv").innerHTML.split(" ");

        let form = /^[0-9 ]+$/;
        for (let i = 0; i < messageList.names.length; i++) {
            let name = messageList.names[i];
            let message = messageList.messages[i];

            // if the input isn't a number, don't bother decrypting
            if (!form.exec(message)) {
                messageList.messages[i] = message;
                continue;
            }

            if (name === "Bob") {
                if (bobKey) {
                    getMessage(message, keyBob[1], keyBob[0], "Bob", i);
                } else {
                    messageList.messages[i] = message;
                }
            } else if (name === "Alice") {
                if (aliceKey) {
                    getMessage(message, keyAlice[1], keyAlice[0], "Alice", i);
                } else {
                    messageList.messages[i] = message;
                }
            } else {
                messageList.messages[i] = message;
            }
        }
    }

    /**
     * addAllToTables
     * Take all messages in Eve's intercepted messages list and add them to
     * the table.
     */
    function addAllToTables() {

        let table = document.getElementById("eveTable");

        // reset eve's table
        table.innerHTML = "";
        let tr = document.createElement("tr");
        let th1 = document.createElement("th");
        let th2 = document.createElement("th");
        th1.innerHTML = "Recipient";
        th2.innerHTML = "Message";
        tr.appendChild(th1);
        tr.appendChild(th2);
        table.appendChild(tr);

        for (let i = 0; i < messageList.names.length; i++) {
            addToTable(messageList.names[i], messageList.messages[i]);
        }
    }

    /**
     * getMessage
     * given an encrypted message and the decryption key, contact the server
     * to decrypt the message.
     * @param msg the message to read
     * @param n the modulus of the decryption key
     * @param d the exponent of the decryption key
     * @param name the target of the message
     * @param i the index of the message list where the message is found
     */
    function getMessage(msg, n, d, name, i) {

        const data = {
            request: "read",
            message: msg,
            n: n,
            d: d
        };

        const fetchOptions = {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        };

        let url = "http://localhost:3000";

        fetch(url, fetchOptions)
            .then(checkStatus)
            .then(function (responseText) {
                let json = JSON.parse(responseText);
                messageList.messages[i] = json["message"];
                addAllToTables();
            })
            .catch(function (error) {
                console.log(error);
            });
    }

})();