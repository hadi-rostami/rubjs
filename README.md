<p align="center">
  <br>
  <b>فریم‌ورک قدرتمند روبیکا برای جاوااسکریپت </b>
</p>

# RubJS

> یک فریم‌ورک مدرن، زیبا و کاملاً غیرهمزمان برای تعامل با API رسمی روبیکا 

---

## 🚀 معرفی

**RubJS** یک فریم‌ورک سبک و ماژولار برای توسعه سریع ربات‌های روبیکایی است. این فریم‌ورک با معماری مبتنی بر Fileter-Base سیستم فرمان‌دهی، زمان‌بندی و تایپ‌سیف، به شما این امکان را می‌دهد که در کمترین زمان، ربات‌هایی سریع، تمیز و قابل گسترش بسازید.

---

##  نمونه کد اولیه برای سلف

```js
const { Client, ClientFilters } = require("rubjs");

const client = new Client("rubjs");

client.command("/admin", [ClientFilters.isPrivate], async (ctx) => {
  await ctx.reply("شما ادمین هستید ✅");
});

client.on("message", [ClientFilters.isGroup], async (ctx) => {
  await ctx.reply("سلام");
});

client.run();
```

--- 


##  نمونه کد اولیه برای ربات

```js
const { Bot, BotFilters } = require("rubjs");

const bot = new Bot("rubjs");

bot.command("/start", async (ctx) => {
  await ctx.reply("ربات استارت شد.");
});

bot.on("message", [Filters.isText], async (ctx) => {
  await ctx.reply("سلام");
});

bot.run();
```
## ✨ ویژگی‌ها

<div dir="rtl">

### پشتیبانی از پلاگین‌ها (Plugin System)  
امکان افزودن قابلیت‌های جدید با پلاگین‌های جداگانه

### طراحی Filters-based  
اجرای نوع جدیدی از فیلتر روی پیام ها  برای فیلت کردن پیام کاربران

### تایپ‌سیف کامل (TypeScript Ready)  
طراحی شده با پشتیبانی کامل از تایپ‌ها برای توسعه‌دهندگان حرفه‌ای.

### سیستم فرمان‌ها (Commands)  
استفاده از `bot.command(pattern, handler)` برای مدیریت پیام‌های فرمان‌محور.

### ابزارهای داخلی توسعه  
مثل `Utils.Bold`, `Utils.Italic` و ... برای زیباتر کردن پاسخ‌ها به کاربر.

### راه اندازی وبسایت همزمان با ربات
با rubjs میتوانید ربات را همزمان با وبسایت استقرار کنید | [اموزش](https://hadi-rostami.github.io/rubjs-docs/blog/running-website-and-bot-simultaneously-with-rubjs)


</div>



## 📦 نصب


```bash
npm install rubjs
```


### مستندات و آموزش‌ها
برای مشاهده مستندات کامل، نمونه‌های بیشتر و راهنمای استفاده، به صفحه رسمی مستندات RubJS مراجعه کنید:

🔗 [مشاهده مستندات RubJS](https://hadi-rostami.github.io/rubjs-docs/)