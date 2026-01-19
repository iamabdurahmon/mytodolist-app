const { Telegraf, Markup } = require("telegraf");
const admin = require("firebase-admin");

// 1. Firebase Admin Setup
const firebaseConfig = {
  apiKey: "AIzaSyAQUZAJl1KIYE1hfXDHnoxGsQAhxi5STTU",
  authDomain: "to-do-list-bot-c91cb.firebaseapp.com",
  databaseURL: "https://to-do-list-bot-c91cb-default-rtdb.firebaseio.com", // O'z bazangiz URL manzili
  projectId: "to-do-list-bot-c91cb",
};

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(), // Yoki databaseURL bilan ulaning
    databaseURL: firebaseConfig.databaseURL,
  });
}
const db = admin.database();

const BOT_TOKEN = "8232438511:AAGD3PX6F90Qdf6WB9Nml3wIFpyy4IBseqc";
const bot = new Telegraf(BOT_TOKEN);
const WEB_LINK = "https://to-do-tg-bot.vercel.app";

// Temporary state for editing
const userState = {};

// Main Menu
bot.start((ctx) => {
  ctx.reply(
    "Welcome! 🚀\nManage your tasks here or via the Web App. Everything stays synced!",
    Markup.keyboard([["📝 My Tasks", "➕ Add New Task"], [Markup.button.webApp("📱 Open Web App", WEB_LINK)]]).resize(),
  );
});

// List Tasks
bot.hears("📝 My Tasks", async (ctx) => {
  const userId = ctx.from.id;
  const snapshot = await db.ref(`todos/${userId}`).once("value");
  const todos = snapshot.val() || [];

  if (todos.length === 0) {
    return ctx.reply("Your list is empty. Try adding a task first!");
  }

  ctx.reply("📂 Your Tasks:");
  todos.forEach((todo, index) => {
    const statusIcon = todo.status === "completed" ? "✅" : "⏳";
    ctx.reply(`${statusIcon} ${todo.name}`, Markup.inlineKeyboard([[Markup.button.callback("✏️ Edit", `edit_${index}`), Markup.button.callback("🗑️ Delete", `delete_${index}`)]]));
  });
});

// Add Task - Step 1
bot.hears("➕ Add New Task", (ctx) => {
  userState[ctx.from.id] = { action: "adding" };
  ctx.reply("Write the name of your new task:");
});

// Text Handling for Add & Edit
bot.on("text", async (ctx) => {
  const userId = ctx.from.id;
  const state = userState[userId];

  if (!state) return;

  const snapshot = await db.ref(`todos/${userId}`).once("value");
  let todos = snapshot.val() || [];

  if (state.action === "adding") {
    todos.push({ name: ctx.message.text, status: "pending" });
    await db.ref(`todos/${userId}`).set(todos);
    ctx.reply("✅ Task added and synced to Web App!");
    delete userState[userId];
  } else if (state.action === "editing") {
    todos[state.index].name = ctx.message.text;
    await db.ref(`todos/${userId}`).set(todos);
    ctx.reply("✅ Task updated successfully!");
    delete userState[userId];
  }
});

// Delete Task Action
bot.action(/delete_(\d+)/, async (ctx) => {
  const index = parseInt(ctx.match[1]);
  const userId = ctx.from.id;
  const snapshot = await db.ref(`todos/${userId}`).once("value");
  let todos = snapshot.val() || [];

  todos.splice(index, 1);
  await db.ref(`todos/${userId}`).set(todos);

  ctx.answerCbQuery("Deleted");
  ctx.editMessageText("🗑️ Task has been removed.");
});

// Edit Task Action
bot.action(/edit_(\d+)/, (ctx) => {
  const index = parseInt(ctx.match[1]);
  userState[ctx.from.id] = { action: "editing", index: index };
  ctx.reply("Send the new name for this task:");
});

bot.launch().then(() => console.log("Sync Bot is running..."));
