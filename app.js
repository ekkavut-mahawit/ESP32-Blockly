// ==========================================
// 1. ตัวแปร Workspace
// ==========================================
window.workspace = null;

// ==========================================
// 2. ฟังก์ชันส่งโค้ดไร้สายไปยัง ESP32
// ==========================================
async function runCode() {
  const btn = document.getElementById('run-btn');

  // ตรวจสอบความพร้อมของระบบ
  if (!window.workspace || typeof Blockly === 'undefined' || !Blockly.Python) {
    alert("⚠️ หน้าเว็บยังโหลดระบบแปลงโค้ดไม่สมบูรณ์\nกรุณาเช็กเน็ต 4G หรือกดรีเฟรชหน้าเว็บอีกครั้งครับ");
    return;
  }

  let userCode = "";
  try {
    userCode = Blockly.Python.workspaceToCode(window.workspace);
  } catch (e) {
    alert("❌ เกิดข้อผิดพลาดในการแปลงโค้ด: " + e.message);
    return;
  }

  // เติม Header Import สำหรับ MicroPython บน ESP32-C3
  let fullCode = "import time\nfrom machine import Pin, PWM, ADC\nimport neopixel\n\n" + userCode;

  btn.innerText = "⏳ กำลังส่งโค้ด...";
  btn.disabled = true;

  try {
    let response = await fetch('/run', {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: fullCode
    });

    if (response.ok) {
      alert("🚀 ส่งโค้ดไปยัง ESP32 สำเร็จแล้ว!");
    } else {
      alert("❌ เกิดข้อผิดพลาดจากบอร์ด Status: " + response.status);
    }
  } catch (err) {
    alert("❌ ส่งโค้ดไม่สำเร็จ: " + err.message);
  } finally {
    btn.innerText = "🚀 ส่งโค้ดไร้สาย (Run)";
    btn.disabled = false;
  }
}

// ==========================================
// 3. เริ่มต้นสร้าง Blockly Workspace
// ==========================================
window.addEventListener('DOMContentLoaded', () => {
  try {
    if (typeof Blockly === 'undefined') return;

    // ล้างพื้นที่เดิม ป้องกันบล็อกสร้างทับซ้อน
    const container = document.getElementById('blocklyDiv');
    if (container) container.innerHTML = '';

    // สร้าง Workspace
    window.workspace = Blockly.inject('blocklyDiv', {
      toolbox: document.getElementById('toolbox'),
      sound: false,
      scrollbars: true,
      trashcan: true,
      move: { scrollbars: true, drag: true, wheel: false },
      zoom: { controls: true, wheel: false, startScale: 0.9, maxScale: 2.0, minScale: 0.5 }
    });

    setTimeout(() => {
      if (window.workspace) Blockly.svgResize(window.workspace);
    }, 300);

    window.addEventListener('resize', () => {
      if (window.workspace) Blockly.svgResize(window.workspace);
    });

    // ==========================================
    // 4. นิยาม Custom Blocks + Python Generator (v9.3.3)
    // ==========================================

    // --- 1. สั่งไฟ LED บนบอร์ด ---
    Blockly.Blocks['set_led'] = {
      init: function() {
        this.appendDummyInput()
            .appendField("สั่งไฟ LED บนบอร์ด")
            .appendField(new Blockly.FieldDropdown([["เปิด (ON)", "0"], ["ปิด (OFF)", "1"]]), "STATE");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(230);
      }
    };
    Blockly.Python['set_led'] = function(block) {
      return `Pin(8, Pin.OUT).value(${block.getFieldValue('STATE')})\n`;
    };

    // --- 2. Digital Write ---
    Blockly.Blocks['digital_write'] = {
      init: function() {
        this.appendDummyInput()
            .appendField("สั่งขา")
            .appendField(new Blockly.FieldNumber(2, 0, 21), "PIN")
            .appendField("สถานะ")
            .appendField(new Blockly.FieldDropdown([["HIGH", "1"], ["LOW", "0"]]), "STATE");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(230);
      }
    };
    Blockly.Python['digital_write'] = function(block) {
      return `Pin(${block.getFieldValue('PIN')}, Pin.OUT).value(${block.getFieldValue('STATE')})\n`;
    };

    // --- 3. Buzzer ---
    Blockly.Blocks['play_buzzer'] = {
      init: function() {
        this.appendDummyInput()
            .appendField("สั่ง Buzzer ขา")
            .appendField(new Blockly.FieldNumber(5, 0, 21), "PIN")
            .appendField("ความถี่")
            .appendField(new Blockly.FieldNumber(1000, 100, 5000), "FREQ")
            .appendField("Hz");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(230);
      }
    };
    Blockly.Python['play_buzzer'] = function(block) {
      return `PWM(Pin(${block.getFieldValue('PIN')}), freq=${block.getFieldValue('FREQ')}, duty=512)\n`;
    };

    // --- 4. Servo Motor ---
    Blockly.Blocks['set_servo'] = {
      init: function() {
        this.appendDummyInput()
            .appendField("สั่ง Servo ขา")
            .appendField(new Blockly.FieldNumber(2, 0, 21), "PIN")
            .appendField("หมุนไป")
            .appendField(new Blockly.FieldNumber(90, 0, 180), "ANGLE")
            .appendField("องศา");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(230);
      }
    };
    Blockly.Python['set_servo'] = function(block) {
      const angle = block.getFieldValue('ANGLE');
      const duty = Math.round(26 + (angle / 180) * 102);
      return `PWM(Pin(${block.getFieldValue('PIN')}), freq=50, duty=${duty})\n`;
    };

    // --- 5. หน่วงเวลา ---
    Blockly.Blocks['delay_time'] = {
      init: function() {
        this.appendDummyInput()
            .appendField("หน่วงเวลา")
            .appendField(new Blockly.FieldNumber(1, 0.1, 60), "SECONDS")
            .appendField("วินาที");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(160);
      }
    };
    Blockly.Python['delay_time'] = function(block) {
      return `time.sleep(${block.getFieldValue('SECONDS')})\n`;
    };

    // --- 6. อ่านค่าอนาล็อก (ADC) ---
    Blockly.Blocks['analog_read'] = {
      init: function() {
        this.appendDummyInput()
            .appendField("อ่านค่าอนาล็อก (ADC) ขา")
            .appendField(new Blockly.FieldNumber(0, 0, 4), "PIN");
        this.setOutput(true, "Number");
        this.setColour(40);
      }
    };
    Blockly.Python['analog_read'] = function(block) {
      return [`ADC(Pin(${block.getFieldValue('PIN')})).read()`, Blockly.Python.ORDER_ATOMIC];
    };

    // --- 7. อ่านค่าสวิตช์ Digital ---
    Blockly.Blocks['digital_read'] = {
      init: function() {
        this.appendDummyInput()
            .appendField("อ่านค่าสวิตช์ ขา")
            .appendField(new Blockly.FieldNumber(4, 0, 21), "PIN");
        this.setOutput(true, "Number");
        this.setColour(40);
      }
    };
    Blockly.Python['digital_read'] = function(block) {
      return [`Pin(${block.getFieldValue('PIN')}, Pin.IN).value()`, Blockly.Python.ORDER_ATOMIC];
    };

    // --- 8. ไฟ RGB NeoPixel ---
    Blockly.Blocks['set_neopixel'] = {
      init: function() {
        this.appendDummyInput()
            .appendField("เปิดไฟ RGB ขา")
            .appendField(new Blockly.FieldNumber(3, 0, 21), "PIN")
            .appendField("สี R:")
            .appendField(new Blockly.FieldNumber(255, 0, 255), "R")
            .appendField("G:")
            .appendField(new Blockly.FieldNumber(0, 0, 255), "G")
            .appendField("B:")
            .appendField(new Blockly.FieldNumber(0, 0, 255), "B");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(330);
      }
    };
    Blockly.Python['set_neopixel'] = function(block) {
      const pin = block.getFieldValue('PIN');
      const r = block.getFieldValue('R');
      const g = block.getFieldValue('G');
      const b = block.getFieldValue('B');
      return `np = neopixel.NeoPixel(Pin(${pin}), 1)\nnp[0] = (${r}, ${g}, ${b})\nnp.write()\n`;
    };

  } catch (err) {
    console.error("Blockly Initialization Error:", err);
  }
});
