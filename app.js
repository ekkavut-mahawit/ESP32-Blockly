// ==========================================
// 1. เริ่มต้นสร้าง Blockly Workspace
// ==========================================
const workspace = Blockly.inject('blocklyDiv', {
  toolbox: document.getElementById('toolbox'),
  sound: false, // ปิดเสียงเพื่อป้องกัน AudioContext warning
  scrollbars: true,
  trashcan: true,
  zoom: {
    controls: true,
    wheel: true,
    startScale: 1.0,
    maxScale: 3.0,
    minScale: 0.3,
    scaleSpeed: 1.2
  }
});

// ปรับขนาด Workspace อัตโนมัติเมื่อขนาดหน้าจอเปลี่ยน
window.addEventListener('resize', () => {
  Blockly.svgResize(workspace);
});

// ==========================================
// 2. ตั้งค่า ตัวแปลโค้ด Python Generator
// ==========================================
const pythonGen = python.pythonGenerator || Blockly.Python;

// ==========================================
// 3. นิยาม Custom Blocks และ Generator (MicroPython)
// ==========================================

// --- บล็อก: สั่งไฟ LED บนบอร์ด ---
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
pythonGen['set_led'] = function(block) {
  const state = block.getFieldValue('STATE');
  return `Pin(8, Pin.OUT).value(${state})\n`;
};

// --- บล็อก: Digital Write (ส่งสัญญาณเปิด/ปิด ขาต่างๆ) ---
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
pythonGen['digital_write'] = function(block) {
  const pin = block.getFieldValue('PIN');
  const state = block.getFieldValue('STATE');
  return `Pin(${pin}, Pin.OUT).value(${state})\n`;
};

// --- บล็อก: Buzzer (ขับเสียงความถี่) ---
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
pythonGen['play_buzzer'] = function(block) {
  const pin = block.getFieldValue('PIN');
  const freq = block.getFieldValue('FREQ');
  return `PWM(Pin(${pin}), freq=${freq}, duty=512)\n`;
};

// --- บล็อก: Servo Motor ---
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
pythonGen['set_servo'] = function(block) {
  const pin = block.getFieldValue('PIN');
  const angle = block.getFieldValue('ANGLE');
  const duty = Math.round(26 + (angle / 180) * 102);
  return `PWM(Pin(${pin}), freq=50, duty=${duty})\n`;
};

// --- บล็อก: หน่วงเวลา ---
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
pythonGen['delay_time'] = function(block) {
  const seconds = block.getFieldValue('SECONDS');
  return `time.sleep(${seconds})\n`;
};

// --- บล็อก: อ่านค่าอนาล็อก (ADC) ---
Blockly.Blocks['analog_read'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("อ่านค่าอนาล็อก (ADC) ขา")
        .appendField(new Blockly.FieldNumber(0, 0, 4), "PIN");
    this.setOutput(true, "Number");
    this.setColour(40);
  }
};
pythonGen['analog_read'] = function(block) {
  const pin = block.getFieldValue('PIN');
  return [`ADC(Pin(${pin})).read()`, pythonGen.ORDER_ATOMIC];
};

// --- บล็อก: อ่านค่าสวิตช์ Digital ---
Blockly.Blocks['digital_read'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("อ่านค่าสวิตช์ ขา")
        .appendField(new Blockly.FieldNumber(4, 0, 21), "PIN");
    this.setOutput(true, "Number");
    this.setColour(40);
  }
};
pythonGen['digital_read'] = function(block) {
  const pin = block.getFieldValue('PIN');
  return [`Pin(${pin}, Pin.IN).value()`, pythonGen.ORDER_ATOMIC];
};

// --- บล็อก: ไฟ RGB NeoPixel ---
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
pythonGen['set_neopixel'] = function(block) {
  const pin = block.getFieldValue('PIN');
  const r = block.getFieldValue('R');
  const g = block.getFieldValue('G');
  const b = block.getFieldValue('B');
  return `np = neopixel.NeoPixel(Pin(${pin}), 1)\nnp[0] = (${r}, ${g}, ${b})\nnp.write()\n`;
};

// ==========================================
// 4. ระบบส่งโค้ดไร้สายไปยัง ESP32 (HTTP POST)
// ==========================================
document.getElementById('run-btn').addEventListener('click', async () => {
  const btn = document.getElementById('run-btn');
  const ip = document.getElementById('board-ip').value.trim();
  
  // สร้างโค้ด MicroPython จากบล็อก
  let code = pythonGen.workspaceToCode(workspace);
  let fullCode = "import time\nfrom machine import Pin, PWM, ADC\nimport neopixel\n\n" + code;

  if (!ip) {
    alert("⚠️ กรุณากรอก IP Address ของบอร์ด ESP32");
    return;
  }

  // ปรับเปลี่ยนข้อความปุ่มเพื่อแจ้งสถานะผู้ใช้
  btn.innerText = "⏳ กำลังเชื่อมต่อ ESP32...";
  btn.disabled = true;

  // ป้องกันการค้างด้วย Timeout (5 วินาที)
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);

  try {
    let response = await fetch(`http://${ip}/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: fullCode,
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      alert("🚀 ส่งโค้ดไปยัง ESP32 สำเร็จแล้ว!");
    } else {
      alert("❌ เกิดข้อผิดพลาดจากบอร์ด: Status " + response.status);
    }
  } catch (err) {
    clearTimeout(timeoutId);
    console.error("Error Detail:", err);

    if (err.name === 'AbortError') {
      alert("⏱️ หมดเวลาเชื่อมต่อ (Timeout)!\nไม่สามารถเชื่อมต่อกับ ESP32 ได้ กรุณาเช็กว่า:\n1. มือถือ/คอมพิวเตอร์ ต่อ Wi-Fi บอร์ดแล้วหรือยัง\n2. กรอก IP Address ถูกต้องหรือไม่");
    } else {
      alert("❌ ส่งไม่สำเร็จ!\nรายละเอียด: " + err.message + "\n\n💡 หากรันบน HTTPS (เช่น GitHub Pages) เบราว์เซอร์จะบล็อกการส่งข้อมูลไปหา HTTP ให้รันผ่านไฟล์ local (file://) หรือ localhost แทนครับ");
    }
  } finally {
    // คืนค่าปุ่มกลับสู่สถานะปกติ
    btn.innerText = "🚀 ส่งโค้ดไร้สาย (Run)";
    btn.disabled = false;
  }
});
