const { Telegraf, Markup } = require("telegraf");
const firebase = require("firebase/app");
require("firebase/database");
const http = require("http");

// Firebase Configuration (app.js dagi bilan bir xil)
const firebaseConfig = {
  apiKey: "AIzaSyAQUZAJl1KIYE1hfXDHnoxGsQAhxi5STTU",
  authDomain: "to-do-list-bot-c91cb.firebaseapp.com",
  databaseURL: "https://to-do-list-bot-c91cb-default-rtdb.firebaseio.com",
  projectId: "to-do-list-bot-c91cb",
};

// Firebase-ni faqat bir marta initialize qilish
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
const db = firebase.database();

const BOT_TOKEN = "8232438511:AAGD3PX6F90Qdf6WB9Nml3wIFpyy4IBseqc";
const bot = new Telegraf(BOT_TOKEN);
const WEB_LINK = "https://to-do-tg-bot.vercel.app";

const userState = {};

// Main Menu
bot.start((ctx) => {
  ctx.reply("Welcome! 🚀 Manage your tasks here or via the Web App.", Markup.keyboard([["📝 My Tasks", "➕ Add Task"], [Markup.button.webApp("📱 Open Web App", WEB_LINK)]]).resize());
});

// List Tasks (Sinxron ko'rinish)
bot.hears("📝 My Tasks", async (ctx) => {
  const userId = ctx.from.id;
  db.ref(`todos/${userId}`).once("value", (snapshot) => {
    const todos = snapshot.val() || [];
    if (todos.length === 0) return ctx.reply("Your list is empty!");

    ctx.reply("📂 Your Tasks:");
    todos.forEach((todo, index) => {
      ctx.reply(`${todo.status === "completed" ? "✅" : "⏳"} ${todo.name}`, Markup.inlineKeyboard([[Markup.button.callback("🗑️ Delete", `delete_${index}`)]]));
    });
  });
});

// Add Task
bot.hears("➕ Add Task", (ctx) => {
  userState[ctx.from.id] = { action: "adding" };
  ctx.reply("Send me the name of the new task:");
});

bot.on("text", async (ctx) => {
  const userId = ctx.from.id;
  const state = userState[userId];
  if (!state) return;

  if (state.action === "adding") {
    db.ref(`todos/${userId}`).once("value", (snapshot) => {
      let todos = snapshot.val() || [];
      todos.push({ name: ctx.message.text, status: "pending" });
      db.ref(`todos/${userId}`).set(todos);
      ctx.reply("✅ Success! Task added and synced to Web App.");
    });
    delete userState[userId];
  }
});

// Delete Task
bot.action(/delete_(\d+)/, async (ctx) => {
  const index = parseInt(ctx.match[1]);
  const userId = ctx.from.id;
  db.ref(`todos/${userId}`).once("value", (snapshot) => {
    let todos = snapshot.val() || [];
    todos.splice(index, 1);
    db.ref(`todos/${userId}`).set(todos);
    ctx.answerCbQuery("Deleted");
    ctx.editMessageText("🗑️ Task removed.");
  });
});

// Render Port
http
  .createServer((req, res) => {
    res.write("Bot Live");
    res.end();
  })
  .listen(process.env.PORT || 3000);

bot.launch().then(() => console.log(">>> BOT IS RUNNING WITHOUT ERRORS! <<<"));
