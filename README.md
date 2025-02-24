<p align="center">
    <br>
    <b>فریمورک API روبیکا برای جاوااسکریپت</b>
</p>

## RubJS

> یک فریمورک مدرن، زیبا و غیرهمزمان (Asynchronous) برای API روبیکا در جاوااسکریپت

### حساب‌ غیرهمزمان

```javascript
const { Client, Utils, Filters } = require("../rubjs");

const bot = new Client("bot");

const object_guid = "object_guid";

const customFilter = (msg) => msg.object_guid === object_guid;

bot.onMessageUpdates([customFilter, Filters.isText], async (message) => {
  await message.reply(`Hello ${Utils.Italic("from")} ${Utils.Bold("RubJS")}! `);
});

bot.run();
```
<p dir="rtl">
  <b>RubJS</b> یک فریمورک مدرن، زیبا و غیرهمزمان است که به شما امکان می‌دهد به‌راحتی با API اصلی روبیکا از طریق یک حساب کاربری (کلاینت سفارشی) با استفاده از جاوا اسکریپت تعامل داشته باشید.
</p>

### ویژگی‌ها

<ul dir="rtl">
  <li>
    <b>آماده</b>: RubJS را با npm نصب کنید و بلافاصله شروع به ساخت برنامه‌های خود کنید.
  </li>
  <li>
    <b>ساده</b>:  API روبیکا را به شکلی ساده و قابل‌فهم ارائه می‌دهد، درحالی‌که قابلیت‌های پیشرفته را نیز حفظ می‌کند.
  </li>
  <li>
    <b>زیبا</b>: جزئیات سطح پایین را انتزاعی کرده و آن‌ها را به روشی مناسب‌تر نمایش می‌دهد.
  </li>
  <li>
    <b>غیرهمزمان</b>: کاملاً غیرهمزمان است
  </li>
  <li>
    <b>قدرتمند</b>: دسترسی کامل به API روبیکا برای اجرای هر عملیات رسمی کلاینت و موارد دیگر.
  </li>
</ul>

### نصب

```bash
npm install rubjs
```
