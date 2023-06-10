const express = require('express');
const puppeteer = require('puppeteer');

const app = express();

app.get('/meeting-schedule', async (req, res) => {
  try {
    const scheduleData = await scrapeMeetingSchedule();
    res.json(scheduleData);
  } catch (error) {
    console.error('ข้อผิดพลาด:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

async function scrapeMeetingSchedule() {
  const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage();

  await page.goto('https://conferences.unite.un.org/announcements/display/bangkok');

  const scheduleData = await page.evaluate(() => {
    const titles = Array.from(document.querySelectorAll('.announcement-title__title')).map((element) => element.textContent.trim());
    const timeRanges = Array.from(document.querySelectorAll('.announcement-time-range')).map((element) => {
      const from = element.querySelector('.announcement-time-range__from').textContent.trim();
      const to = element.querySelector('.announcement-time-range__to').textContent.trim();
      return { from, to };
    });
    const roomNames = Array.from(document.querySelectorAll('.announcement-room-name')).map((element) => element.textContent.trim());

    return titles.map((title, index) => {
      return {
        title,
        from: timeRanges[index].from,
        to: timeRanges[index].to,
        room: roomNames[index]
      };
    });
  });

  await browser.close();

  return scheduleData;
}

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`เซิร์ฟเวอร์ทำงานอยู่บนพอร์ต ${port}`);
});
