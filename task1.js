function isPrime(number) {
  if (number < 2) {
    return false;
  }

  for (let divisor = 2; divisor <= Math.sqrt(number); divisor++) {
    if (number % divisor === 0) {
      return false;
    }
  }

  return true;
}

const numbers = Array.from({ length: 100 }, (_, index) => index + 1);
const results = [];

for (let index = numbers.length - 1; index >= 0; index--) {
  const number = numbers[index];

  if (isPrime(number)) {
    continue;
  }

  if (number % 3 === 0 && number % 5 === 0) {
    results.push("FooBar");
  } else if (number % 3 === 0) {
    results.push("Foo");
  } else if (number % 5 === 0) {
    results.push("Bar");
  } else {
    results.push(number);
  }
}

console.log(results.join(" "));
