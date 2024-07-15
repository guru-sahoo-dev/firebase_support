const TransNotification = require("../models/notification");
const NotifLogs = require("../models/notifLogs");
const NotifQueue = require("../models/notifQueue");

const firebaseAdmin = require("firebase-admin"); //version: "^9.12.0"
const serviceAccount = require("../config/serviceAccount.json");

firebaseAdmin.initializeApp({
  credential: firebaseAdmin.credential.cert(serviceAccount),
});

const sendNotif = async (notifData) => {
  const sentUsers = [];
  const deliveredUsers = [];
  const failedUsers = [];
  const [{ title: sentTitle }] = notifData;
  let sentStatus = "failed";
  const uniqueNotifArr = await getUniqueTokens(notifData);

  for (const notifRecord of uniqueNotifArr) {
    const { token, userid, title, body, image, navigateto } = notifRecord;
    const payload = {
      notification: { title, body, image },
      data: { navigateto },
    };

    await firebaseAdmin
      .messaging()
      .sendToDevice(token, payload)
      .then(async (resp) => {
        // console.log("notifResp", resp.results[0]);
        sentUsers.push(userid);
        sentStatus = "success";

        if (resp.successCount === 1) {
          deliveredUsers.push(userid);

          await new TransNotification(notifRecord).save();
        } else failedUsers.push(userid);
      })
      .catch((err) => console.error("err", err.message));

    await new Promise((resolve) => setTimeout(resolve, 2000));

    continue;
  }

  await new NotifLogs({
    sentTitle,
    sentUsers,
    deliveredUsers,
    failedUsers,
    sentStatus,
  }).save();
};

const executeNotifQueue = async (req, res) => {
  try {
    const queueData = await NotifQueue.find(
      { status: "queue" },
      { notifArr: 1 }
    );

    if (queueData.length > 0) {
      const [{ _id, notifArr }] = queueData;

      sendNotif(notifArr);

      await NotifQueue.updateOne({ _id }, { $set: { status: "sent" } });

      res.status(200).send({ msg: "notif queue execute success" });
    } else res.status(400).send({ msg: "0 notif queue to execute" });
  } catch (err) {
    res.status(500).send({ err: err.message });
  }
};

module.exports = { executeNotifQueue };
