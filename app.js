const workspace = Blockly.inject('blocklyDiv', {
  toolbox: document.getElementById('toolbox')
});

const pythonGen = Blockly.Python || python.pythonGenerator;

// --- บล็อกคำสั่งพื้นฐาน ---
Blockly.Blocks['set_led'] = {
  init: function() {
    this.appendDummyInput().appendField("สั่งไฟ LED บนบอร์ด").appendField(new Blockly.FieldDropdown([["เปิด (ON)", "0"], ["ปิด (OFF)", "1"]]), "STATE");
    this.setPreviousStatement(true, null); this.setNextStatement(true, null); this.setColour(230);
  }
};
pythonGen['set_led'] = function(block) {
  return `Pin(8, Pin.OUT).value(${block.getFieldValue('STATE')})\n`;
};

Blockly.Blocks['digital_write'] = {
  init: function() {
    this.appendDummyInput().appendField("สั่งขา").appendField(new Blockly.FieldNumber(2, 0, 21), "PIN").appendField("สถานะ").appendField(new Blockly.FieldDropdown([["HIGH", "1"], ["LOW", "0"]]), "STATE");
    this.setPreviousStatement(true, null); this.setNextStatement(true, null); this.setColour(230);
  }
};
pythonGen['digital_write'] = function(block) {
  return `Pin(${block.getFieldValue('PIN')}, Pin.OUT).value(${block.getFieldValue('STATE')})\n`;
};

Blockly.Blocks['play_buzzer'] = {
  init: function() {
    this.appendDummyInput().appendField("สั่ง Buzzer ขา").appendField(new Blockly.FieldNumber(5, 0, 21), "PIN").appendField("ความถี่").appendField(new Blockly.FieldNumber(1000, 100, 5000), "FREQ").appendField("Hz");
    this.setPreviousStatement(true, null); this.setNextStatement(true, null); this.setColour(230);
  }
};
pythonGen['play_buzzer'] = function(block) {
  return `PWM(Pin(${block.getFieldValue('PIN')}), freq=${block.getFieldValue('FREQ')}, duty=512)\n`;
};

Blockly.Blocks['set_servo'] = {
  init: function() {
    this.appendDummyInput().appendField("สั่ง Servo ขา").appendField(new Blockly.FieldNumber(2, 0, 21), "PIN").appendField("หมุนไป").appendField(new Blockly.FieldNumber(90, 0, 180), "ANGLE").appendField("องศา");
    this.setPreviousStatement(true, null); this.setNextStatement(true, null); this.setColour(230);
  }
};
pythonGen['set_servo'] = function(block) {
  var duty = Math.round(26 + (block.getFieldValue('ANGLE') / 180) * 102);
  return `PWM(Pin(${block.getFieldValue('PIN')}), freq=50, duty=${duty})\n`;
};

Blockly.Blocks['delay_time'] = {
  init: function() {
    this.appendDummyInput().appendField("หน่วงเวลา").appendField(new Blockly.FieldNumber(1, 0.1, 60), "SECONDS").appendField("วินาที");
    this.setPreviousStatement(true, null); this.setNextStatement(true, null); this.setColour(160);
  }
};
pythonGen['delay_time'] = function(block) {
  return `time.sleep(${block.getFieldValue('SECONDS')})\n`;
};

Blockly.Blocks['analog_read'] = {
  init: function() {
    this.appendDummyInput().appendField("อ่านค่าอนาล็อก (ADC) ขา").appendField(new Blockly.FieldNumber(0, 0, 4), "PIN");
    this.setOutput(true, "Number"); this.setColour(40);
  }
};
pythonGen['analog_read'] = function(block) {
  return [`ADC(Pin(${block.getFieldValue('PIN')})).read()`, Blockly.Python.ORDER_ATOMIC];
};

Blockly.Blocks['digital_read'] = {
  init: function() {
    this.appendDummyInput().appendField("อ่านค่าสวิตช์ ขา").appendField(new Blockly.FieldNumber(4, 0, 21), "PIN");
    this.setOutput(true, "Number"); this.setColour(40);
  }
};
pythonGen['digital_read'] = function(block) {
  return [`Pin(${block.getFieldValue('PIN')}, Pin.IN).value()`, Blockly.Python.ORDER_ATOMIC];
};

Blockly.Blocks['set_neopixel'] = {
  init: function() {
    this.appendDummyInput().appendField("เปิดไฟ RGB ขา").appendField(new Blockly.FieldNumber(3, 0, 21), "PIN").appendField("สี R:").appendField(new Blockly.FieldNumber(255, 0, 255), "R").appendField("G:").appendField(new Blockly.FieldNumber(0, 0, 255), "G").appendField("B:").appendField(new Blockly.FieldNumber(0, 0, 255), "B");
    this.setPreviousStatement(true, null); this.setNextStatement(true, null); this.setColour(330);
  }
};
pythonGen['set_neopixel'] = function(block) {
  return `np = neopixel.NeoPixel(Pin(${block.getFieldValue('PIN')}), 1)\nnp[0] = (${block.getFieldValue('R')}, ${block.getFieldValue('G')}, ${block.getFieldValue('B')})\nnp.write()\n`;
};

// --- ระบบส่งโค้ดผ่าน Wi-Fi (HTTP POST) ---
document.getElementById('run-btn').addEventListener('click', async () => {
  const ip = document.getElementById('board-ip').value;
  let code = pythonGen.workspaceToCode(workspace);
  
  let fullCode = "import time\nfrom machine import Pin, PWM, ADC\nimport neopixel\n" + code;

  try {
    let response = await fetch(`http://${ip}/run`, {
      method: 'POST',
      body: fullCode
    });

    if (response.ok) {
      alert("🚀 ส่งโค้ดไปยัง ESP32 สำเร็จแล้ว!");
    } else {
      alert("เกิดข้อผิดพลาดจากบอร์ด: " + response.status);
    }
  } catch (err) {
    alert("❌ ส่งไม่สำเร็จ! กรุณาเช็กว่ามือถือต่อ Wi-Fi 'ESP32-Blockly' หรือยัง?");
  }
});