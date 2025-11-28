import { Tutorial } from '@/types';

export const blinkLedTutorial: Tutorial = {
    id: 'blink-led',
    title: 'Blink LED - Your First ESP32 Project',
    description: 'Learn the basics of ESP32 programming by creating a simple LED blinking program. Understand GPIO pins, digitalWrite, and delay functions.',
    difficulty: 'beginner',
    steps: [
        {
            id: 'step-1',
            title: 'Understanding ESP32 GPIO Pins',
            content: `Welcome to your first ESP32 project! 🎉

The ESP32 is a powerful microcontroller with multiple GPIO (General Purpose Input/Output) pins. These pins can be programmed to control external devices like LEDs, motors, sensors, and more.

**Key Concepts:**
- **GPIO**: General Purpose Input/Output pins
- **Digital Output**: Setting a pin to HIGH (3.3V) or LOW (0V)
- **Built-in LED**: Most ESP32 boards have a built-in LED connected to GPIO pin 2

**What We'll Build:**
A simple program that makes an LED blink on and off repeatedly. This is the "Hello World" of embedded programming!`,
            learningObjectives: [
                'Understand what GPIO pins are',
                'Learn about digital HIGH and LOW states',
                'Know how to identify pin numbers on ESP32'
            ],
            quizRequired: true
        },
        {
            id: 'step-2',
            title: 'Arduino Setup Functions',
            content: `Every Arduino program (sketch) has two main functions:

**1. setup()** - Runs once when the board starts
\`\`\`cpp
void setup() {
  // Initialization code here
  // Runs only ONCE
}
\`\`\`

**2. loop()** - Runs repeatedly forever
\`\`\`cpp
void loop() {
  // Main code here
  // Runs OVER and OVER
}
\`\`\`

**Pin Configuration:**
Before using a GPIO pin, we must configure it as INPUT or OUTPUT using \`pinMode()\`:
\`\`\`cpp
pinMode(pinNumber, MODE);
// MODE can be: OUTPUT, INPUT, INPUT_PULLUP
\`\`\``,
            learningObjectives: [
                'Understand the setup() and loop() structure',
                'Learn how to configure pins with pinMode()',
                'Know when to use OUTPUT vs INPUT modes'
            ],
            quizRequired: true
        },
        {
            id: 'step-3',
            title: 'Controlling LEDs with digitalWrite',
            content: `To control an LED, we use the \`digitalWrite()\` function:

**Turning LED ON:**
\`\`\`cpp
digitalWrite(LED_PIN, HIGH);
\`\`\`

**Turning LED OFF:**
\`\`\`cpp
digitalWrite(LED_PIN, LOW);
\`\`\`

**Adding Delays:**
The \`delay()\` function pauses the program for a specified time (in milliseconds):
\`\`\`cpp
delay(1000);  // Wait 1 second (1000ms)
delay(500);   // Wait 0.5 seconds (500ms)
\`\`\`

**Complete Blink Pattern:**
\`\`\`cpp
digitalWrite(LED_PIN, HIGH);  // Turn LED ON
delay(1000);                   // Wait 1 second
digitalWrite(LED_PIN, LOW);   // Turn LED OFF
delay(1000);                   // Wait 1 second
\`\`\``,
            learningObjectives: [
                'Use digitalWrite() to control pin states',
                'Understand HIGH and LOW voltage levels',
                'Use delay() to create timing patterns'
            ],
            quizRequired: true,
            codeTemplate: `// ESP32 Blink LED Tutorial
// Built-in LED is on GPIO 2

#define LED_PIN 2

void setup() {
  // Initialize the LED pin as an output
  pinMode(LED_PIN, OUTPUT);
}

void loop() {
  // Turn the LED ON
  digitalWrite(LED_PIN, HIGH);
  delay(1000);  // Wait for 1 second
  
  // Turn the LED OFF
  digitalWrite(LED_PIN, LOW);
  delay(1000);  // Wait for 1 second
}`
        }
    ]
};

export const allTutorials: Tutorial[] = [
    blinkLedTutorial
];
