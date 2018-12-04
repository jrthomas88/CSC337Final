/**

 RSApp_service.js
 Author: Jon Thomas
 Class: CSC-337 Fall 2018

 Back-end service for RSApp.  Performs the following services for the
 front-end component:

 1. Retrieves public keys from a key file
 2. Stores new keys in key files
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

/**
 * app.get
 * provides two services:
 * 1. primes: generate the values needed for keygen, namely primes p and q,
 *    along with encryption exponent e.
 * 2. key: given a name, provide the public key associated with that user
 */
app.get('/', function (req, res) {
        let param = req.query.msg;
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

            res.send(JSON.stringify(data));
        }

        if (param === "key") {
            let name = req.query.name;
            fs.readFile(name + ".key", 'utf8', function (err, contents) {
                    if (err) {
                        console.log(err);
                        res.status(400);
                        return;
                    }
                    contents = contents.split(/\s+/);
                    let e = contents[0];
                    let n = contents[1];

                    data["E"] = e;
                    data["N"] = n;
                    res.status(200);
                    res.send(JSON.stringify(data));
                }
            );
        }
    }
);

/**
 * app.post
 * provides 5 services:
 * 1. keygen: user supplies p,q, and e.  Server generates and returns n,
 *    phi(n), e, and d.
 * 2. encrypt: user provides a name and a message.  The server obtains the
 *    public key of that name and encrypts the message using their public key.
 * 3. decrypt: same as encrypt, uses private key instead.
 * 4. crack: user provides a public key.  Finds corresponding private key.
 * 5. read: applies a given key to a given message.
 */
app.post('/', jsonParser, function (req, res) {

    const reqType = req.body.request;
    let data = {};

    // when generating a key
    if (reqType === "keygen") {
        const name = req.body.name;
        const p = req.body.P;
        const q = req.body.Q;
        const e = req.body.E;

        let n = p * q;
        let phiN = (p - 1) * (q - 1);
        let d = inverse(e, phiN);

        if (!isPrime(parseInt(p)) || !isPrime(parseInt(q))) {
            res.status(444);
            return;
        }

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

    // when encrypting a message
    if (reqType === 'encrypt') {
        const name = req.body.name;
        const message = req.body.message;

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

                data["message"] = encrypt(messageNum, n, e);
                res.status(200);
                res.send(JSON.stringify(data));
            }
        );
    }

    // when decrypting a message
    if (reqType === 'decrypt') {

        const name = req.body.name;
        const message = req.body.message;

        fs.readFile(name + ".key", 'utf8', function (err, contents) {
                if (err) {
                    console.log(err);
                    res.status(400);
                    return;
                }
                contents = contents.split(/\s+/);
                let d = contents[2];
                let n = contents[1];

                let messageVal = message.split(" ");

                let encrypted = encrypt(messageVal, n, d);

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

    if (reqType === 'crack') {
        const e = req.body.e;
        const n = req.body.n;

        let p = findFactor(n);
        let q = n / p;

        let phiN = (p - 1) * (q - 1);
        data["D"] = inverse(e, phiN);
        data["N"] = n;
        res.status(200);
        res.send(JSON.stringify(data));
    }

    if (reqType === 'read') {
        const message = req.body.message;
        const n = req.body.n;
        const d = req.body.d;

        let msgList = message.split(" ");
        let dec = encrypt(msgList, n, d);

        let string = "";
        for (let i = 0; i < msgList.length; i++) {
            string += alphabetize(dec[i]);
        }
        data["message"] = string;
        res.status(200);
        res.send(JSON.stringify(data));
    }
});

/**
 * alphabetize
 * takes a number and converts it to a string.  Does so by treating the
 * alphabet as a base-28 (skips 0 and includes spaces) number system.
 * @param message the numerical message to translate
 * @returns {string} the alphabetized message
 */
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

/**
 * encrypt
 * given a list of numbers, use the provided key to encrypt those numbers
 * @param messageList the list of numbers to encrypt
 * @param n the modulus of the key
 * @param e the encryption exponent
 * @returns {Array} encrypted numbers
 */
function encrypt(messageList, n, e) {
    let encryptList = [];

    for (let i = 0; i < messageList.length; i++) {
        let m_mod_n = modexp(messageList[i], e, n);

        encryptList.push(m_mod_n);
    }

    return encryptList;
}

/**
 * modexp
 * raises a number to a given power, mod some modulus.  Does so using
 * repeated squaring.
 * @param m the base value
 * @param e the exponent
 * @param n the modulus
 * @returns {number} the results of m^e mod n
 */
function modexp(m, e, n) {

    m = parseInt(m);
    n = parseInt(n);
    e = parseInt(e);

    let powers = [];
    let exp = [];

    let p = 1;

    // get powers of two
    while (p < e) {
        powers.push(m % n);
        m = (m * m) % n;
        exp.push(p);
        p *= 2;
    }

    let answer = 1;

    // break up into products of powers
    for (let i = exp.length - 1; i >= 0; i--) {
        if (exp[i] <= e) {
            answer = (answer * powers[i]) % n;
            e -= exp[i];
        }
    }

    return answer;
}

/**
 * inverse
 * finds the inverse of a mod n.  If no such inverse exists, returns -1
 * @param a the original number
 * @param n the modulus
 * @returns {number} the inverse of a mod n
 */
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

/**
 * gcd
 * finds the greatest common divisor of a and b.
 * @param a
 * @param b
 * @returns {number} gcd(a,n)
 */
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

/**
 * generatePrimes
 * generates a list of primes.  These primes are then used for key
 * generation or key cracking.
 */
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

/**
 * isPrime
 * returns true if a number is in the list of primes
 * @param num the nunber in question
 * @returns {boolean} true if number is prime
 */
function isPrime(num) {
    for (let i = 0; i < primes.length; i++) {
        if (primes[i] === num) {
            return true;
        }
        if (primes[i] > num) {
            return false;
        }
    }
    return false
}

/**
 * findFactor
 * finds a prime factor of num.
 * @param num the number being factored
 * @returns {number} a prime factor of num
 */
function findFactor(num) {
    for (let i = 0; i < primes.length; i++) {
        if (num % primes[i] === 0) {
            return primes[i];
        }
    }
    return -1;
}

/**
 * numbify
 * converts a string into a number.  Does so by treating the string as a
 * base-28 encoded number (spaces included, 0 ignored).  Breaks string into
 * messages < n.
 * @param message integer
 * @param n modulus message must be less than
 * @returns {Array} list of numbers.
 */
function numbify(message, n) {

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



