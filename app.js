require('dotenv').config();
const Imap = require("imap");
const simpleParser = require("mailparser").simpleParser;

const imap = new Imap({
    user: process.env.USER_MAIL,
    password: process.env.PASSWORD,
    host: "outlook.office365.com",
    port: 993,
    tls: true
});

process.on("unhandledRejection", up => {
    throw up;
});

async function connect() {
    return new Promise((resolve, reject) => {
        imap.on("ready", resolve);
        imap.on('error', err => reject(err));
        imap.connect();
    });
}

async function openMailBox() {
    return new Promise((resolve, reject) => {
        imap.openBox("Other", (error, mailbox) => {
            if (error) reject(error);
            resolve(mailbox);
        });
    });
}

/**
 * @returns {string[]}
 */
async function getMails() {
    const box = await openMailBox();

    return new Promise((resolve, reject) => {
        const imapFetch = imap.seq.fetch(box.messages.total + ":*", {
            bodies: '',
            struct: true,
            markSeen: false
        });

        imapFetch.on("message", msg => {
            msg.on("body", async stream => {
                const { text } = await simpleParser(stream);
                if (text) {
                    let t = text.split("\n").filter(x => x !== "");
                    if (t.includes('FE')) {
                        resolve(t);
                    }
                }
            });
        }).on('error', err => reject(err));
        imapFetch.once("error", err => reject(err));
    });
}

async function openPR() {

}

async function checkMergeRequests() {
    const con = await connect();
    const mails = await getMails();

    if (mails.length > 0) {
        console.log(mails);
    }
}

(() => {
    checkMergeRequests();
})()

module.exports = {
    imap,
    connect,
    getMails,
    checkMergeRequests,
    openPR
 }