# webring.wonderful.software

[“วงแหวนเว็บ”](https://webring.wonderful.software) แห่งนี้สร้างขึ้นเพื่อส่งเสริมให้ศิลปิน นักออกแบบ และนักพัฒนาชาวไทย สร้างเว็บไซต์ของตัวเองและแบ่งปันการเข้าชมซึ่งกันและกัน

## ร่วมวง

หากคุณมีเว็บไซต์ส่วนตัวสำหรับเผยแพร่ แบ่งปันความรู้ หรือนำเสนอผลงานของตัวเอง ขอเชิญมาร่วมวงแหวนเว็บนี้

เว็บไซต์ในวงแหวนเว็บแห่งนี้ควรจะ:

- เป็นเว็บไซต์ส่วนตัว ไม่แสวงหากำไร (เช่น เว็บพอร์ตโฟลิโอ เว็บบล็อก [สวนดิจิทัล](https://joelhooks.com/digital-garden))
- มีการเผยแพร่ผลงานบนเว็บไซต์ (ไม่รับเว็บที่เป็นหน้า Coming soon, Under construction หรือมีแค่ลิงค์ไปยังโซเชียลเน็ตเวิร์ค)
- อยู่บนโดเมนของตัวเอง (ไม่รับเว็บที่ใช้โดเมนสาธารณะ เช่น `.github.io`, `.netlify.app`, `.firebaseapp.com` หรือ `.web.app`)

โดยที่:

- เนื้อหาบนเว็บเป็นภาษาไทยหรือภาษาอังกฤษก็ได้
- สามารถส่งได้มากกว่า 1 เว็บไซต์
- ผู้ดูแลขอสงวนสิทธ์ในการคัดเลือกเว็บที่จะอยู่ในวง ตามหลักการเดียวกันกับ [Hotline Webring](https://hotlinewebring.club/#:~:text=Do%20you%20allow%20any%20website%20into%20Hotline%20Webring?)

ขั้นตอนการเข้าร่วม:

1. ลิงค์เว็บของคุณมาที่วงแหวนเว็บนี้:

   ```html
   <a href="https://webring.wonderful.software#YOUR.DOMAIN" title="วงแหวนเว็บ">
     <img
       alt="วงแหวนเว็บ"
       width="32"
       height="32"
       src="https://webring.wonderful.software/webring.black.svg"
     />
   </a>
   ```

   - อย่าลืมเปลี่ยน `YOUR.DOMAIN` เป็นชื่อโดเมนเว็บของคุณ
   - ไว้ตำแหน่งไหนของหน้าเว็บก็ได้ สามารถปรับขนาดและสีของไอคอนได้

   ไฟล์ไอคอน:

   - <https://webring.wonderful.software/webring.black.svg>
   - <https://webring.wonderful.software/webring.white.svg>
   - <https://webring.wonderful.software/webring.svg> (สามารถโหลดไฟล์ SVG ไปปรับเปลี่ยนสีได้)

2. แก้ไขไฟล์ [index.html](index.html) เพิ่มลิงค์ไปยังเว็บของคุณ

   - `id` เป็นชื่อโดเมนเว็บไซต์ของคุณ
   - `href` ไม่ต้องลงท้ายด้วย `/` หลังชื่อโดเมน
   - `data-owner` ใส่ GitHub Username ของคุณ
   - `data-feed` ใส่ URL สำหรับ RSS/Atom feed (ถ้ามี)
   - **รูปตัวอย่างเว็บจะยังไม่ขึ้น** (ระบบจะทำการสร้าง screenshot หน้าเว็บให้ หลังจากที่ PR ถูก merge แล้ว ด้วยความละเอียด 375x640@2x)

3. เปิด Pull Request มาพร้อมระบุตำแหน่งของไอคอนบน Desktop และ Mobile

## ข้อมูล

สามารถถึงข้อมูลเว็บที่อยู่ในวงในรูปแบบ JSON โดยใช้ URL นี้:

| ข้อมูล | URL |
| --- | --- |
| รายชื่อเว็บ | <https://wonderfulsoftware.github.io/webring-site-data/data.json> |
| บทความล่าสุด | <https://wonderfulsoftware.github.io/webring-site-data/feed.json> |

## โซเชียลเน็ตเวิร์ค

สามารถติดตามบทความใหม่จากสมาชิกในวงแหวนเว็บได้ผ่านทางช่องทางต่อไปนี้:

- [Facebook](https://www.facebook.com/webring.in.th)
- [Mastodon](https://mastodon.in.th/@webring)
- [Bluesky](https://bsky.app/profile/webring.in.th)

เราใช้[ระบบอัตโนมัติ](https://github.com/wonderfulsoftware/webring-social)ในการโพสต์บทความใหม่ขึ้นโซเชียลเน็ตเวิร์ค

หากคุณใช้โปรแกรม[ฟีดรีดเดอร์](https://th.wikipedia.org/wiki/%E0%B8%9F%E0%B8%B5%E0%B8%94%E0%B8%A3%E0%B8%B5%E0%B8%94%E0%B9%80%E0%B8%94%E0%B8%AD%E0%B8%A3%E0%B9%8C) คุณสามารถแอดเว็บในวงแหวนเว็บเข้าไปโดยใช้ไฟล์ [OPML](https://wonderfulsoftware.github.io/webring-site-data/feed.opml)

หากคุณ[ใช้โดเมนของคุณเองเป็น handle บน Bluesky](https://bsky.social/about/blog/4-28-2023-domain-handle-tutorial) คุณจะถูกติดตามโดย[บัญชี Bluesky ของเรา](https://bsky.app/profile/webring.in.th/follows) และถูกเพิ่มเข้าไปในรายชื่อ[สมาชิกวงแหวนเว็บบน Bluesky](https://bsky.app/profile/webring.in.th/lists/3l7kuilcstu2z) โดยอัตโนมัติ

## แรงบันดาลใจ

วงแหวนเว็บนี้ได้รับแรงบันดาลใจจาก [XXIIVV/webring](https://github.com/XXIIVV/webring)
