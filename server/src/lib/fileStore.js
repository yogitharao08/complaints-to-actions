import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { demoComplaints, demoDepartments, demoStatusLogs, demoUsers } from "../seed/demoData.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.resolve(__dirname, "../../data");
const complaintsFile = path.join(dataDir, "complaints.json");
const statusLogsFile = path.join(dataDir, "statusLogs.json");
const usersFile = path.join(dataDir, "users.json");
const departmentsFile = path.join(dataDir, "departments.json");

function ensureDataDir() {
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
}

function readJson(file, fallback) {
  ensureDataDir();
  if (!fs.existsSync(file)) {
    fs.writeFileSync(file, JSON.stringify(fallback, null, 2));
    return structuredClone(fallback);
  }

  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch (_error) {
    fs.writeFileSync(file, JSON.stringify(fallback, null, 2));
    return structuredClone(fallback);
  }
}

function writeJson(file, records) {
  ensureDataDir();
  fs.writeFileSync(file, JSON.stringify(records, null, 2));
}

export function getStoredComplaints() {
  return readJson(complaintsFile, demoComplaints);
}

export function saveStoredComplaints(records) {
  writeJson(complaintsFile, records);
  return records;
}

export function getStoredStatusLogs() {
  return readJson(statusLogsFile, demoStatusLogs);
}

export function saveStoredStatusLogs(records) {
  writeJson(statusLogsFile, records);
  return records;
}

export function getStoredUsers() {
  return readJson(usersFile, demoUsers);
}

export function saveStoredUsers(records) {
  writeJson(usersFile, records);
  return records;
}

export function getStoredDepartments() {
  return readJson(departmentsFile, demoDepartments);
}

export function saveStoredDepartments(records) {
  writeJson(departmentsFile, records);
  return records;
}
