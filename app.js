// ======================================================
// 1. นิยามโครงสร้างบล็อกคำสั่ง (Custom Blocks)
// ======================================================

// บล็อกหน่วงเวลา (Time Delay)
Blockly.Blocks['time_delay'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("หน่วงเวลา")
        .appendField(new Blockly.FieldNumber(1, 0), "SECONDS")
        .appendField("วินาที");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(45);
  }
};
Blockly.Python['time_delay'] = function(block) {
  var seconds = block.getFieldValue('SECONDS');
  Blockly.Python.definitions_['import_time'] = 'import time';
  return 'time.sleep(' + seconds + ')\n';
};

// บล็อกดิจิทัล LED
Blockly.Blocks['digital_write'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("สั่งงาน LED ขา")
        .appendField(new Blockly.FieldNumber(8), "PIN")
        .appendField("สถานะ")
        .appendField(new Blockly.FieldDropdown([["เปิด (HIGH)", "1"], ["ปิด (LOW)", "0"]]), "STATE");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(210);
  }
};
Blockly.Python['digital_write'] = function(block) {
  var pin = block.getFieldValue('PIN');
  var state = block.getFieldValue('STATE');
  Blockly.Python.definitions_['import_pin'] = 'from machine import Pin';
  Blockly.Python.definitions_['pin_' + pin] = 'pin_' + pin + ' = Pin(' + pin + ', Pin.OUT)';
  return 'pin_' + pin + '.value(' + state + ')\n';
};

// บล็อก PWM / อนาล็อก LED
Blockly.Blocks['analog_write'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("ปรับความสว่าง LED ขา")
        .appendField(new Blockly.FieldNumber(8), "PIN")
        .appendField("ค่า (0-1023)")
        .appendField(new Blockly.FieldNumber(512, 0, 1023), "VALUE");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(210);
  }
};
Blockly.Python['analog_write'] = function(block) {
  var pin = block.getFieldValue('PIN');
  var val = block.getFieldValue('VALUE');
  Blockly.Python.definitions_['import_pwm'] = 'from machine import Pin, PWM';
  Blockly.Python.definitions_['pwm_' + pin] = 'pwm_' + pin + ' = PWM(Pin(' + pin + '))';
  return 'pwm_' + pin + '.duty(' + val + ')\n';
};

// บล็อกเซอร์โว
Blockly.Blocks['servo_move'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("หมุน Servo ขา")
        .appendField(new Blockly.FieldNumber(18), "PIN")
        .appendField("ไปที่")
        .appendField(new Blockly.FieldNumber(90, 0, 180), "ANGLE")
        .appendField("องศา");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(330);
  }
};
Blockly.Python['servo_move'] = function(block) {
  var pin = block.getFieldValue('PIN');
  var angle = block.getFieldValue('ANGLE');
  Blockly.Python.definitions_['import_pwm'] = 'from machine import Pin, PWM';
  Blockly.Python.definitions_['servo_' + pin] = 'servo_' + pin + ' = PWM(Pin(' + pin + '), freq=50)';
  var duty = Math.round(26 + (angle / 180) * (123 - 26));
  return 'servo_' + pin + '.duty(' + duty + ')\n';
};

// บล็อกจอ OLED
Blockly.Blocks['oled_print'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("แสดงจอ OLED ข้อความ")
        .appendField(new Blockly.FieldTextInput("Hello ESP32"), "TEXT");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(160);
  }
};
Blockly.Python['oled_print'] = function(block) {
  var text = block.getFieldValue('TEXT');
  Blockly.Python.definitions_['import_oled'] = 'from machine import Pin, I2C\nimport ssd1306\ni2c = I2C(0, scl=Pin(22), sda=Pin(21))\noled = ssd1306.SSD1306_I2C(128, 64, i2c)';
  return 'oled.fill(0)\noled.text("' + text + '", 0, 0)\noled.show()\n';
};

// บล็อกอ่านเซนเซอร์จับเส้น
Blockly.Blocks['line_sensor_read'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("อ่านค่าเซนเซอร์จับเส้น ขา")
        .appendField(new Blockly.FieldNumber(13), "PIN");
    this.setOutput(true, "Number");
    this.setColour(120);
  }
};
Blockly.Python['line_sensor_read'] = function(block) {
  var pin = block.getFieldValue('PIN');
  Blockly.Python.definitions_['import_pin'] = 'from machine import Pin';
  Blockly.Python.definitions_['sensor_' + pin] = 'sensor_' + pin + ' = Pin(' + pin + ', Pin.IN)';
  return ['sensor_' + pin + '.value()', Blockly.Python.ORDER_ATOMIC];
};


// ======================================================
// 2. เริ่มต้นสร้าง Blockly Workspace
// ======================================================
var workspace = Blockly.inject('blocklyDiv', {
    toolbox: document.getElementById('toolbox'),
    scrollbars: true,
    zoom: { controls: true, wheel: true, startScale: 1.0 },
    trashcan: true
});

var isHardwareMode = true; 
var connectionType = null; // 'usb' หรือ 'ble'

var serialPort = null; 
var rxCharacteristic = null;

const NUS_SERVICE_UUID = '6e400001-b5a3-f393-e0a9-e50e24dcca9e';
const NUS_RX_UUID      = '6e400002-b5a3-f393-e0a9-e50e24dcca9e';


// ======================================================
// 3. ระบบเชื่อมต่อ USB (Web Serial)
// ======================================================
async function connectUSB() {
    if ("serial" in navigator) {
        try {
            serialPort = await navigator.serial.requestPort();
            await serialPort.open({ baudRate: 115200 });
            
            connectionType = 'usb';
            updateUIConnectionStatus('USB Connected');
            alert("✅ เชื่อมต่อบอร์ดผ่านสาย USB สำเร็จ!");
        } catch (err) {
            alert("❌ เชื่อมต่อ USB ไม่สำเร็จ: " + err);
        }
    } else {
        alert("⚠️ เบราว์เซอร์นี้ไม่รองรับ Web Serial\nแนะนำให้ใช้ Google Chrome หรือ Kiwi Browser");
    }
}


// ======================================================
// 4. ระบบเชื่อมต่อ Bluetooth (Web BLE)
// ======================================================
async function connectBLE() {
    if ("bluetooth" in navigator) {
        try {
            const device = await navigator.bluetooth.requestDevice({
                filters: [{ namePrefix: 'ESP32' }],
                optionalServices: [NUS_SERVICE_UUID]
            });

            const server = await device.gatt.connect();
            const service = await server.getPrimaryService(NUS_SERVICE_UUID);
            rxCharacteristic = await service.getCharacteristic(NUS_RX_UUID);

            connectionType = 'ble';
            updateUIConnectionStatus('BLE Connected');
            alert("✅ เชื่อมต่อบลูทูธ (BLE) สำเร็จ!");
        } catch (err) {
            alert("❌ เชื่อมต่อ Bluetooth ไม่สำเร็จ: " + err);
        }
    } else {
        alert("⚠️ เบราว์เซอร์นี้ไม่รองรับ Web Bluetooth");
    }
}


function updateUIConnectionStatus(status) {
    var usbBtn = document.getElementById('usbBtn');
    var bleBtn = document.getElementById('bleBtn');

    if (status === 'USB Connected') {
        usbBtn.innerText = "🟢 USB พร้อมใช้งาน";
        usbBtn.style.backgroundColor = "#16a34a";
        bleBtn.innerText = "📶 บลูทูธ (BLE)";
        bleBtn.style.backgroundColor = "#9333ea";
    } else if (status === 'BLE Connected') {
        bleBtn.innerText = "🟢 BLE พร้อมใช้งาน";
        bleBtn.style.backgroundColor = "#16a34a";
        usbBtn.innerText = "🔌 เสียบสาย USB";
        usbBtn.style.backgroundColor = "#0284c7";
    }
}


// ======================================================
// 5. ฟังก์ชันส่งโค้ดประมวลผล
// ======================================================
async function executeCode() {
    var code = Blockly.Python.workspaceToCode(workspace);

    if (!code.trim()) {
        alert('⚠️ กรุณาลากบล็อกคำสั่งมาวางก่อนกดรันครับ');
        return;
    }

    if (!isHardwareMode) {
        var simFrame = document.getElementById('simFrame').contentWindow;
        simFrame.postMessage({ type: 'wokwi:set-code', code: code }, '*');
        alert('🚀 ส่งโค้ดไปยังตัวจำลองเรียบร้อยแล้ว!');
        return;
    }

    // ใช้ Paste Mode REPL (\x05 เข้าโหมด, \x04 ประมวลผล)
    const formattedCode = "\x05" + code + "\x04";
    const encoder = new TextEncoder();
    const data = encoder.encode(formattedCode);

    if (connectionType === 'usb' && serialPort && serialPort.writable) {
        try {
            const writer = serialPort.writable.getWriter();
            await writer.write(data);
            writer.releaseLock();
            alert("🚀 ส่งโค้ดผ่าน USB สำเร็จ!");
        } catch (err) {
            alert("❌ ส่งโค้ดทาง USB ล้มเหลว: " + err);
        }
    } else if (connectionType === 'ble' && rxCharacteristic) {
        try {
            const chunkSize = 20;
            for (let i = 0; i < data.length; i += chunkSize) {
                const chunk = data.slice(i, i + chunkSize);
                await rxCharacteristic.writeValue(chunk);
            }
            alert("🚀 ส่งโค้ดผ่าน Bluetooth สำเร็จ!");
        } catch (err) {
            alert("❌ ส่งโค้ดทาง Bluetooth ล้มเหลว: " + err);
        }
    } else {
        alert("⚠️ กรุณากดปุ่มเชื่อมต่อ USB หรือ บลูทูธ ก่อนทำการรันโค้ดครับ");
    }
}

function toggleMode() {
    isHardwareMode = !isHardwareMode;
    var modeBtn = document.getElementById('modeBtn');
    var simContainer = document.getElementById('simContainer');

    if (isHardwareMode) {
        modeBtn.innerText = "🔄 โหมด: บอร์ดจริง";
        modeBtn.style.backgroundColor = "#f59e0b";
        simContainer.style.display = "none";
    } else {
        modeBtn.innerText = "🔄 โหมด: ตัวจำลอง (Simulator)";
        modeBtn.style.backgroundColor = "#3b82f6";
        simContainer.style.display = "flex";
    }
    
    setTimeout(function() { Blockly.svgResize(workspace); }, 100);
}
