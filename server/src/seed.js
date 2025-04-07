import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { db, connectToDatabase } from './config/db_config.js';
import User from './schema/User.js';
import Role from './schema/Role.js';
import UserRole from './schema/UserRole.js';
import Student from './schema/Student.js';
import Staff from './schema/Staff.js';
import Tutor from './schema/Tutor.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function cleanValue(value) {
  if (!value) return null;
  return value.replace(/[\r\n]/g, '').trim();
}

async function readDemoData(filename) {
  try {
    const filePath = path.join(__dirname, '../../demo_data', filename);
    console.log(`Reading data from ${filePath}`);
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.trim().split('\n');
    
    // Get headers and clean them
    const headers = lines[0].split('\t').map(h => cleanValue(h.replace(/"/g, '')));
    console.log('Headers:', headers);
    
    // Process data lines
    const data = lines.slice(1)
      .filter(line => line.trim())
      .map(line => {
        const values = line.split('\t').map(v => cleanValue(v.replace(/"/g, '')));
        const obj = {};
        headers.forEach((header, i) => {
          obj[header] = values[i];
        });
        console.log('Processed row:', obj);
        return obj;
      });
    
    return data;
  } catch (error) {
    console.error(`Error reading demo data from ${filename}:`, error);
    throw error;
  }
}

async function seedDatabase() {
  try {
    // First connect to the database
    await connectToDatabase();
    console.log('Connected to database successfully');

    // Import users
    console.log('Importing users...');
    const users = await readDemoData('user.txt');
    console.log(`Found ${users.length} users to import`);
    for (const user of users) {
      console.log('Importing user:', user);
      await db.insert(User).values({
        userId: user.userId,
        username: user.username,
        password: user.password,
        email: user.email,
        isActive: user.isActive === 't',
        isLocked: user.isLocked === 't',
        biography: user.biography
      });
    }
    console.log(`Imported ${users.length} users`);

    // Import roles
    console.log('Importing roles...');
    const roles = await readDemoData('role.txt');
    console.log(`Found ${roles.length} roles to import`);
    for (const role of roles) {
      console.log('Importing role:', role);
      await db.insert(Role).values({
        roleId: role.roleId,
        roleName: role.roleName,
        description: role.description
      });
    }
    console.log(`Imported ${roles.length} roles`);

    // Import user roles
    console.log('Importing user roles...');
    const userRoles = await readDemoData('user_role.txt');
    console.log(`Found ${userRoles.length} user roles to import`);
    for (const userRole of userRoles) {
      console.log('Importing user role:', userRole);
      await db.insert(UserRole).values({
        userId: userRole.userId,
        roleId: userRole.roleId
      });
    }
    console.log(`Imported ${userRoles.length} user roles`);

    // Import students
    console.log('Importing students...');
    const students = await readDemoData('student.txt');
    console.log(`Found ${students.length} students to import`);
    for (const student of students) {
      console.log('Importing student:', student);
      await db.insert(Student).values({
        studentId: student.studentId,
        userId: student.userId
      });
    }
    console.log(`Imported ${students.length} students`);

    // Import staff
    console.log('Importing staff...');
    const staff = await readDemoData('staff.txt');
    console.log(`Found ${staff.length} staff members to import`);
    for (const staffMember of staff) {
      console.log('Importing staff member:', staffMember);
      await db.insert(Staff).values({
        staffId: staffMember.staffId,
        userId: staffMember.userId
      });
    }
    console.log(`Imported ${staff.length} staff members`);

    // Import tutors
    console.log('Importing tutors...');
    const tutors = await readDemoData('tutor.txt');
    console.log(`Found ${tutors.length} tutors to import`);
    for (const tutor of tutors) {
      console.log('Importing tutor:', tutor);
      await db.insert(Tutor).values({
        tutorId: tutor.tutorId,
        userId: tutor.userId
      });
    }
    console.log(`Imported ${tutors.length} tutors`);

    console.log('Demo data imported successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
}

seedDatabase().catch(error => {
  console.error('Failed to seed database:', error);
  process.exit(1);
}); 