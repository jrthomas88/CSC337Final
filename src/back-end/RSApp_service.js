/**

 RSApp_service.js
 Author: Jon Thomas
 Class: CSC-337 Fall 2018

 Back-end service for RSApp.  Performs the following services for the
 front-end component:

 1. Retrieves public keys from the MySQL database
 2. Stores new keys in the MySQL database
 3. Perform encryption using a public key
 4. Perform decryption using a provided private key
 5. Generate prime numbers
 6. Find a factor of a provided number

 **/

console.log("Starting service, please wait....");

const express = require("express");
const app = express();
let fs = require("fs");
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();

let primes = [];
generatePrimes(); // generate ~10,000 primes

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.use(express.static('public'));

app.get('/', function (req, res) {
        let param = req.query.msg;
        console.log("Received message: " + param);
        if (!param) {
            param = "";
        }

        let data = {};

        // "primes" means generate values for the key
        if (param === "primes") {
            let index1 = Math.floor(Math.random() * primes.length);
            let index2 = Math.floor(Math.random() * primes.length);
            data["P"] = primes[index1];
            data["Q"] = primes[index2];
            let phiN = (primes[index1] - 1) * (primes[index2] - 1);
            let e = Math.floor(Math.random() * primes[primes.length - 1]);

            while (gcd(phiN, e) !== 1) {
                e = Math.floor(Math.random() * primes[primes.length - 1]);
            }

            data["E"] = e;

            console.log("Sending message...");
            res.send(JSON.stringify(data));
        }
    }
);

app.post('/', jsonParser, function (req, res) {

    console.log("Received post request.");

    const reqType = req.body.request;
    let data = {};

    // when generating a key
    if (reqType === "keygen") {
        const name = req.body.name;
        const p = req.body.P;
        const q = req.body.Q;
        const e = req.body.E;

        console.log("Values are " + p + ", " + q + ", and " + e + ".");

        let n = p * q;
        let phiN = (p - 1) * (q - 1);
        let d = inverse(e, phiN);

        console.log("Key vals are n = " + n + ", phi(n) = "
            + phiN + ", and d = " + d + ".");

        if (d === -1) {
            res.status(444); // 444 means invalid e value
            return;
        }


        data["N"] = n;
        data["PHI"] = phiN;
        data["E"] = e;
        data["D"] = d;

        let key = e + " " + n + "\n" + d + " " + n;

        fs.writeFile(name + ".key", key, function (err) {
            if (err) {
                console.log(err);
                res.status(400);
                return;
            }
            console.log("The file was saved!");
            res.status(200);
            res.send(JSON.stringify(data));
        });
    }

    if (reqType === 'encrypt') {
        const name = req.body.name;
        const message = req.body.message;

        console.log("message = " + message);

        fs.readFile(name + ".key", 'utf8', function (err, contents) {
                if (err) {
                    console.log(err);
                    res.status(400);
                    return;
                }
                contents = contents.split(/\s+/);
                let e = contents[0];
                let n = contents[1];
                let messageNum = numbify(message, n);

                console.log("Message Num:");
                for (let i = 0; i < messageNum.length; i++) {
                    console.log("\t" + messageNum[i]);
                }

                let encrypted = encrypt(messageNum, n, e);

                console.log("encrypted = " + encrypted);

                data["message"] = encrypted;
                res.status(200);
                res.send(JSON.stringify(data));
            }
        );
    }

    if (reqType === 'decrypt') {

        console.log("*****DECRYPT*****");

        const name = req.body.name;
        const message = req.body.message;

        console.log("message = " + message);

        fs.readFile(name + ".key", 'utf8', function (err, contents) {
                if (err) {
                    console.log(err);
                    res.status(400);
                    return;
                }
                contents = contents.split(/\s+/);
                console.log(contents);
                let d = contents[2];
                let n = contents[1];

                console.log("d = " + d + ", n = " + n);

                let messageVal = message.split(" ");

                let encrypted = encrypt(messageVal, n, d);

                console.log("decrypted = " + encrypted);

                let string = "";
                for (let i = 0; i < encrypted.length; i++) {
                    string += alphabetize(encrypted[i]);
                }

                data["message"] = string;
                res.status(200);
                res.send(JSON.stringify(data));
            }
        );
    }
});

function alphabetize(message) {
    let string = "";
    message = parseInt(message);

    while (message) {
        let char = message % 28;
        message = Math.floor(message / 28);
        if (char === 27) {
            string = " " + string;
        } else {
            char += 96;
            string = String.fromCharCode(char) + string;
        }
    }
    return string;
}

function encrypt(messageList, n, e) {
    let encryptList = [];

    for (let i = 0; i < messageList.length; i++) {
        let m_mod_n = modexp(messageList[i], e, n);

        console.log(messageList[i] + "^" + e + " mod " + n + " = " + m_mod_n);

        encryptList.push(m_mod_n);
    }

    return encryptList;
}

function modexp(m, e, n) {

    m = parseInt(m);
    n = parseInt(n);
    e = parseInt(e);

    let powers = [];
    let exp = [];

    let p = 1;

    while (p < e) {
        powers.push(m % n);
        m = (m * m) % n;
        exp.push(p);
        p *= 2;
    }

    console.log(exp);
    console.log(powers);

    let answer = 1;

    for (let i = exp.length - 1; i >= 0; i--) {
        if (exp[i] <= e) {
            answer = (answer * powers[i]) % n;
            e -= exp[i];

            console.log("answer = " + answer);
            console.log("e = " + e);
        }
    }

    return answer;
}


function inverse(a, n) {
    let t = 0;
    let r = n;
    let newT = 1;
    let newR = a;

    while (newR !== 0) {
        let quotient = Math.floor(r / newR);
        let prov = newT;
        newT = t - (quotient * prov);
        t = prov;
        prov = newR;
        newR = r - (quotient * prov);
        r = prov;
    }
    if (r > 1) {
        return -1;
    }
    if (t < 0) {
        return t + n;
    }
    return t;

}

function gcd(a, b) {
    a = Math.abs(a);
    b = Math.abs(b);
    if (b > a) {
        let temp = a;
        a = b;
        b = temp;
    }
    while (true) {
        if (b === 0) return a;
        a %= b;
        if (a === 0) return b;
        b %= a;
    }
}


function generatePrimes() {
    primes.push(2);
    let numbers = [];
    let maxNumber = 10000;

    for (let i = 3; i < maxNumber; i += 2) {
        numbers.push(i);
    }

    while (numbers.length) {
        primes.push(numbers.shift());
        numbers = numbers.filter(function (i) {
            return i % primes[primes.length - 1] !== 0;
        });
    }
}

function findFactor(num) {
    for (let i = 0; i < primes.length; i++) {
        if (num % primes[i] === 0) {
            return primes[i];
        }
    }
}

function numbify(message, n) {

    console.log("Numbify Message: " + message);
    n = parseInt(n);

    let number = 0;
    let messageList = [];

    for (let i = 0; i < message.length; i++) {
        if (message.charAt(i) === " ") {
            number = (number * 28) + 27;
        } else {
            number = (number * 28) + message.charAt(i).charCodeAt(0) - 96;
        }
        if (number >= n) {
            let messagesA = numbify(message.substring(0, message.length / 2), n);
            let messagesB = numbify(message.substring(message.length / 2, message.length), n);
            for (let i = 0; i < messagesA.length; i++) {
                messageList.push(messagesA[i]);
            }
            for (let i = 0; i < messagesB.length; i++) {
                messageList.push(messagesB[i]);
            }
            return messageList;
        }
    }

    messageList.push(number);
    return messageList;
}


console.log("Setup finished, listening on port 3000.");

app.listen(3000);



