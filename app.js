// ======================================================
// 1. นิยามโครงสร้างบล็อกคำสั่ง (Custom Blocks & Python Generators)
// ======================================================

// 1.1 บล็อกหน่วงเวลา (Time Delay)
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

// 1.2 บล็อกสั่งงาน LED / ดิจิทัล (Digital Write)
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

// 1.3 บล็อกบัซเซอร์ส่งเสียง (Buzzer)
Blockly.Blocks['play_buzzer'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("ส่งเสียง Buzzer ขา")
        .appendField(new Blockly.FieldNumber(5), "PIN")
        .appendField("ความถี่")
        .appendField(new Blockly.FieldNumber(1000, 100, 5000), "FREQ")
        .appendField("Hz เป็นเวลา")
        .appendField(new Blockly.FieldNumber(0.5, 0.1), "TIME")
        .appendField("วิ");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(210);
  }
};
Blockly.Python['play_buzzer'] = function(block) {
  var pin = block.getFieldValue('PIN');
  var freq = block.getFieldValue('FREQ');
  var time = block.getFieldValue('TIME');
  Blockly.Python.definitions_['import_pwm'] = 'from machine import Pin, PWM';
  Blockly.Python.definitions_['import_time'] = 'import time';
  var code = 'bz = PWM(Pin(' + pin + '), freq=' + freq + ', duty=512)\n';
  code += 'time.sleep(' + time + ')\n';
  code += 'bz.deinit()\n';
  return code;
};

// 1.4 บล็อกอ่านค่าอนาล็อก (Analog Read / ADC)
Blockly.Blocks['analog_read'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("อ่านค่าอนาล็อก ADC ขา")
        .appendField(new Blockly.FieldNumber(1), "PIN");
    this.setOutput(true, "Number");
    this.setColour(45);
  }
};
Blockly.Python['analog_read'] = function(block) {
  var pin = block.getFieldValue('PIN');
  Blockly.Python.definitions_['import_adc'] = 'from machine import Pin, ADC';
  Blockly.Python.definitions_['adc_' + pin] = 'adc_' + pin + ' = ADC(Pin(' + pin + '))';
  return ['adc_' + pin + '.read()', Blockly.Python.ORDER_ATOMIC];
};

// 1.5 บล็อกอ่านค่าดิจิทัล / ปุ่มกด (Digital Read)
Blockly.Blocks['digital_read'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("อ่านค่าดิจิทัล ขา")
        .appendField(new Blockly.FieldNumber(9), "PIN");
    this.setOutput(true, "Number");
    this.setColour(45);
  }
};
Blockly.Python['digital_read'] = function(block) {
  var pin = block.getFieldValue('PIN');
  Blockly.Python.definitions_['import_pin'] = 'from machine import Pin';
  Blockly.Python.definitions_['in_pin_' + pin] = 'in_pin_' + pin + ' = Pin(' + pin + ', Pin.IN)';
  return ['in_pin_' + pin + '.value()', Blockly.Python.ORDER_ATOMIC];
};

// 1.6 บล็อกอ่านค่าเซนเซอร์จับเส้น (Line Sensor)
Blockly.Blocks['line_sensor_read'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("อ่านค่าเซนเซอร์จับเส้น ขา")
        .appendField(new Blockly.FieldNumber(10), "PIN");
    this.setOutput(true, "Number");
    this.setColour(45);
  }
};
Blockly.Python['line_sensor_read'] = function(block) {
  var pin = block.getFieldValue('PIN');
  Blockly.Python.definitions_['import_pin'] = 'from machine import Pin';
  Blockly.Python.definitions_['sensor_' + pin] = 'sensor_' + pin + ' = Pin(' + pin + ', Pin.IN)';
  return ['sensor_' + pin + '.value()', Blockly.Python.ORDER_ATOMIC];
};

// 1.7 บล็อกหมุนเซอร์โว (Servo Move)
Blockly.Blocks['servo_move'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("หมุน Servo ขา")
        .appendField(new Blockly.FieldNumber(2), "PIN")
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

// 1.8 บล็อกไฟ RGB NeoPixel
Blockly.Blocks['set_neopixel'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("ติดไฟ NeoPixel ขา")
        .appendField(new Blockly.FieldNumber(8), "PIN")
        .appendField("ดวงที่")
        .appendField(new Blockly.FieldNumber(0), "NUM")
        .appendField("สี R:")
        .appendField(new Blockly.FieldNumber(255, 0, 255), "R")
        .appendField("G:")
        .appendField(new Blockly.FieldNumber(0, 0, 255), "G")
        .appendField("B:")
        .appendField(new Blockly.FieldNumber(0, 0, 255), "B");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(300);
  }
};
Blockly.Python['set_neopixel'] = function(block) {
  var pin = block.getFieldValue('PIN');
  var num = block.getFieldValue('NUM');
  var r = block.getFieldValue('R');
  var g = block.getFieldValue('G');
  var b = block.getFieldValue('B');
  Blockly.Python.definitions_['import_neopixel'] = 'from machine import Pin\nimport neopixel';
  Blockly.Python.definitions_['np_' + pin] = 'np_' + pin + ' = neopixel.NeoPixel(Pin(' + pin + '), 8)';
  return 'np_' + pin + '[' + num + '] = (' + r + ', ' + g + ', ' + b + ')\nnp_' + pin + '.write()\n';
};

// 1.9 บล็อกแสดงผลจอ OLED (ปรับขา I2C ให้ตรงกับ ESP32-C3)
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
  // 💡 ปรับ SCL=7, SDA=6 เพื่อให้ตรงกับโครงสร้าง ESP32-C3
  Blockly.Python.definitions_['import_oled'] = 'from machine import Pin, I2C\nimport ssd1306\ni2c = I2C(0, scl=Pin(7), sda=Pin(6))\noled = ssd1306.SSD1306_I2C(128, 64, i2c)';
  return 'oled.fill(0)\noled.text("' + text + '", 0, 0)\noled.show()\n';
};


// ======================================================
// 2. ระบบเชื่อมต่อ & โหลด Workspace
// ======================================================
var workspace = null;
var isHardwareMode = true; 
var connectionType = null; 

var serialPort = null; 
var rxCharacteristic = null;

const NUS_SERVICE_UUID = '6e400001-b5a3-f393-e0a9-e50e24dcca9e';
const NUS_RX_UUID      = '6e400002-b5a3-f393-e0a9-e50e24dcca9e';

// โหลด Workspace เมื่อ DOM พร้อมใช้งาน 100%
document.addEventListener('DOMContentLoaded', function() {
    workspace = Blockly.inject('blocklyDiv', {
        toolbox: document.getElementById('toolbox'),
        scrollbars: true,
        zoom: { controls: true, wheel: true, startScale: 1.0 },
        trashcan: true
    });
});


// ======================================================
// 3. ฟังก์ชันการเชื่อมต่อ USB / BLE / Execution
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

// ฟังก์ชันหน่วงเวลาช่วยเว้นจังหวะการส่ง Serial
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

async function executeCode() {
    if (!workspace) return;
    var code = Blockly.Python.workspaceToCode(workspace);

    if (!code.trim()) {
        alert('⚠️ กรุณาลากบล็อกคำสั่งมาวางก่อนกดรันครับ');
        return;
    }

    // =======================================
    // 0. การส่งโค้ดไปยัง Wokwi Simulator
    // =======================================
    // =======================================
    // 0. การส่งโค้ดไปยัง Wokwi Simulator
    // =======================================
    // =======================================
    // 0. การส่งโค้ดไปยัง Wokwi Simulator
    // =======================================
    if (!isHardwareMode) {
        var simIframe = document.getElementById('simFrame');
        if (simIframe && simIframe.contentWindow) {

            // 1. ส่งโค้ดเข้า Wokwi แค่คำสั่งเดียว
            simIframe.contentWindow.postMessage({
                type: 'wokwi:set-code',
                code: code
            }, '*');

            // 2. เว้นจังหวะ 200ms แล้วสั่ง รีสตาร์ท / เริ่มรัน
            setTimeout(function() {
                simIframe.contentWindow.postMessage({
                    type: 'wokwi:restart'
                }, '*');
            }, 200);

            alert("🚀 ส่งโค้ดไปยังตัวจำลองเรียบร้อยแล้ว!");
        } else {
            alert("⚠️ ไม่พบส่วนแสดงผล Simulator");
        }
        return;
    }

    // =======================================
    // 1. การส่งโค้ดผ่านสาย USB (Web Serial)
    // =======================================
    if (connectionType === 'usb' && serialPort && serialPort.writable) {
        try {
            const encoder = new TextEncoder();

            // สเต็ป A: ส่ง Ctrl+C 2 ครั้ง เพื่อเบรกและยกเลิกโปรแกรมเดิมที่รันอยู่
            let writer = serialPort.writable.getWriter();
            await writer.write(encoder.encode("\x03\x03"));
            writer.releaseLock();

            // สเต็ป B: หน่วงเวลา 0.2 วินาที ให้ MicroPython เคลียร์ REPL ให้พร้อม
            await delay(200);

            // สเต็ป C: ส่งโค้ดชุดใหม่เข้าโหมด Paste Mode (\x05 ... \x04)
            writer = serialPort.writable.getWriter();
            const formattedCode = "\x05" + code + "\x04";
            await writer.write(encoder.encode(formattedCode));
            writer.releaseLock();

            alert("🚀 อัปเดตโค้ดใหม่ผ่าน USB สำเร็จ!");
        } catch (err) {
            alert("❌ ส่งโค้ดทาง USB ล้มเหลว: " + err);
        }

    // =======================================
    // 2. การส่งโค้ดผ่าน บลูทูธ (Web BLE)
    // =======================================
    } else if (connectionType === 'ble' && rxCharacteristic) {
        try {
            const encoder = new TextEncoder();
            
            // ส่ง Ctrl+C เคลียร์สถานะก่อนส่งโค้ด BLE
            const formattedCode = "\x03\x03\x05" + code + "\x04";
            const data = encoder.encode(formattedCode);

            const chunkSize = 20;
            for (let i = 0; i < data.length; i += chunkSize) {
                const chunk = data.slice(i, i + chunkSize);
                await rxCharacteristic.writeValue(chunk);
                await delay(20); // เว้นระยะห่างกันชน BLE Buffer เต็ม
            }
            alert("🚀 อัปเดตโค้ดใหม่ผ่าน Bluetooth สำเร็จ!");
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
    
    if (workspace) {
        setTimeout(function() { Blockly.svgResize(workspace); }, 100);
    }
}
