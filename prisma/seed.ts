import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Clean existing data
  await prisma.testResult.deleteMany()
  await prisma.submission.deleteMany()
  await prisma.testCase.deleteMany()
  await prisma.problem.deleteMany()
  await prisma.user.deleteMany()

  // Create student account
  const hashedPassword = await bcrypt.hash('password123', 12)
  const student = await prisma.user.create({
    data: {
      name: 'Test Student',
      email: 'student@test.com',
      password: hashedPassword,
      role: 'STUDENT',
    },
  })
  console.log(`  Created student: ${student.email}`)

  // Create teacher account
  const teacher = await prisma.user.create({
    data: {
      name: 'Test Teacher',
      email: 'teacher@test.com',
      password: hashedPassword,
      role: 'TEACHER',
    },
  })
  console.log(`  Created teacher: ${teacher.email}`)

  // Create Problem 1: Two Sum
  const problem1 = await prisma.problem.create({
    data: {
      title: 'Two Sum',
      description: `Write a function called \`add(a, b)\` that takes two integers and returns their sum.

Example:
  Input: a = 2, b = 3
  Output: 5

Constraints:
  - -1000 <= a, b <= 1000

Write your solution in the code editor below. The function should read two integers from input (each on a new line or space-separated) and print the result.`,
      language: 'python',
      difficulty: 'EASY',
      templateCode: `def add(a, b):
    # Your code here
    return a + b

# Read input and call the function
if __name__ == "__main__":
    a = int(input().strip())
    b = int(input().strip())
    print(add(a, b))`,
      timeLimit: 5,
      isPublished: true,
    },
  })

  // Test cases for Problem 1
  const p1TestCases = [
    { problemId: problem1.id, input: '2\n3', expectedOutput: '5', isSample: true, order: 0 },
    { problemId: problem1.id, input: '-5\n10', expectedOutput: '5', isSample: true, order: 1 },
    { problemId: problem1.id, input: '0\n0', expectedOutput: '0', isSample: false, order: 2 },
    { problemId: problem1.id, input: '100\n200', expectedOutput: '300', isSample: false, order: 3 },
    { problemId: problem1.id, input: '-100\n-200', expectedOutput: '-300', isSample: false, order: 4 },
  ]

  for (const tc of p1TestCases) {
    await prisma.testCase.create({ data: tc })
  }
  console.log(`  Created problem: "${problem1.title}" with ${p1TestCases.length} test cases`)

  // Create Problem 2: Is Prime
  const problem2 = await prisma.problem.create({
    data: {
      title: 'Is Prime',
      description: `Write a function called \`is_prime(n)\` that checks whether a given integer is a prime number.

A prime number is a number greater than 1 that has no positive divisors other than 1 and itself.

Example:
  Input: 7
  Output: True

  Input: 4
  Output: False

Constraints:
  - 1 <= n <= 10000

Write your solution below. The program should read one integer from input and print "True" or "False".`,
      language: 'python',
      difficulty: 'MEDIUM',
      templateCode: `def is_prime(n):
    # Your code here
    pass

# Read input and call the function
if __name__ == "__main__":
    n = int(input().strip())
    print(is_prime(n))`,
      timeLimit: 5,
      isPublished: true,
    },
  })

  // Test cases for Problem 2
  const p2TestCases = [
    { problemId: problem2.id, input: '7', expectedOutput: 'True', isSample: true, order: 0 },
    { problemId: problem2.id, input: '4', expectedOutput: 'False', isSample: true, order: 1 },
    { problemId: problem2.id, input: '1', expectedOutput: 'False', isSample: false, order: 2 },
    { problemId: problem2.id, input: '2', expectedOutput: 'True', isSample: false, order: 3 },
    { problemId: problem2.id, input: '17', expectedOutput: 'True', isSample: false, order: 4 },
    { problemId: problem2.id, input: '100', expectedOutput: 'False', isSample: false, order: 5 },
    { problemId: problem2.id, input: '9973', expectedOutput: 'True', isSample: false, order: 6 },
  ]

  for (const tc of p2TestCases) {
    await prisma.testCase.create({ data: tc })
  }
  console.log(`  Created problem: "${problem2.title}" with ${p2TestCases.length} test cases`)

  console.log('\nSeed completed!')
  console.log('  Student login: student@test.com / password123')
  console.log('  Teacher login: teacher@test.com / password123')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
