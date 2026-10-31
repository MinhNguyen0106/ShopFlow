/**
 * ShopFlow - Memory Consistency & Verification Tool
 * 
 * Script kiểm tra tự động tính đồng bộ của bộ ba tệp bộ nhớ (Triple-Memory Protocol):
 * 1. .agents/memory/history.md
 * 2. .agents/memory/project_context.md
 * 3. .agents/memory/decisions.md
 * Đối chiếu chéo với Task.md, Frontend routes, và Database schemas.
 */

import fs from 'node:fs';
import path from 'node:path';

const ROOT_DIR = process.cwd();
const MEMORY_DIR = path.join(ROOT_DIR, '.agents', 'memory');
const TASK_MD_PATH = path.join(ROOT_DIR, 'Task.md');
const HISTORY_MD_PATH = path.join(MEMORY_DIR, 'history.md');
const CONTEXT_MD_PATH = path.join(MEMORY_DIR, 'project_context.md');
const DECISIONS_MD_PATH = path.join(MEMORY_DIR, 'decisions.md');
const FRONTEND_APP_DIR = path.join(ROOT_DIR, 'frontend', 'src', 'app', '(dashboard)');

interface CheckResult {
  name: string;
  passed: boolean;
  message: string;
  details?: string[];
}

const results: CheckResult[] = [];

console.log('\n======================================================');
console.log('🔍 SHOPFLOW TRIPLE-MEMORY VERIFICATION AUDIT');
console.log('======================================================\n');

// 1. Kiểm tra sự tồn tại của các tệp cốt lõi
const coreFiles = [
  { name: 'Task.md', path: TASK_MD_PATH },
  { name: '.agents/memory/history.md', path: HISTORY_MD_PATH },
  { name: '.agents/memory/project_context.md', path: CONTEXT_MD_PATH },
  { name: '.agents/memory/decisions.md', path: DECISIONS_MD_PATH }
];

let allFilesExist = true;
const missingFiles: string[] = [];

for (const f of coreFiles) {
  if (!fs.existsSync(f.path)) {
    allFilesExist = false;
    missingFiles.push(f.name);
  }
}

results.push({
  name: 'Kiểm tra sự tồn tại của các tệp bộ nhớ cốt lõi',
  passed: allFilesExist,
  message: allFilesExist ? 'Tất cả 4 tệp cốt lõi đều hiện diện đầy đủ.' : `Thiếu các tệp: ${missingFiles.join(', ')}`
});

if (!allFilesExist) {
  printReportAndExit();
}

// Đọc nội dung các tệp
const taskContent = fs.readFileSync(TASK_MD_PATH, 'utf-8');
const historyContent = fs.readFileSync(HISTORY_MD_PATH, 'utf-8');
const contextContent = fs.readFileSync(CONTEXT_MD_PATH, 'utf-8');
const decisionsContent = fs.readFileSync(DECISIONS_MD_PATH, 'utf-8');

// 2. Kiểm tra tính đồng bộ Task.md vs history.md (Các Task đã hoàn thành)
const completedTasksInTaskMd: string[] = [];
const taskRegex = /- \[x\] \*\*\[(TASK-\d+)\]\*\*/g;
let match: RegExpExecArray | null;

while ((match = taskRegex.exec(taskContent)) !== null) {
  if (!completedTasksInTaskMd.includes(match[1])) {
    completedTasksInTaskMd.push(match[1]);
  }
}

const missingTasksInHistory: string[] = [];
for (const taskId of completedTasksInTaskMd) {
  if (!historyContent.includes(taskId)) {
    missingTasksInHistory.push(taskId);
  }
}

results.push({
  name: 'Đồng bộ Task hoàn thành giữa Task.md và history.md',
  passed: missingTasksInHistory.length === 0,
  message: missingTasksInHistory.length === 0
    ? `Tất cả ${completedTasksInTaskMd.length} tasks đã hoàn thành đều có trong history.md.`
    : `Các tasks sau có trong Task.md nhưng chưa được ghi nhận vào history.md: ${missingTasksInHistory.join(', ')}`,
  details: completedTasksInTaskMd
});

// 3. Kiểm tra phần tổng kết Sprint ở cuối history.md
const sprintMatches = taskContent.match(/Sprint Hiện Tại:\*\* (Sprint \d+)/i);
const currentSprint = sprintMatches ? sprintMatches[1] : null;

let sprintSummaryPassed = true;
const sprintIssues: string[] = [];

if (currentSprint) {
  if (!historyContent.includes(`[Đang Thực Hiện] - ${currentSprint}`) && !historyContent.includes(`Sprint Hiện Tại`)) {
    // Kiểm tra xem có mục Sprint hiện tại ở phần cuối history.md hay không
    const sprintRegex = new RegExp(`## \\[Đang Thực Hiện\\].*?${currentSprint}`, 'i');
    if (!sprintRegex.test(historyContent)) {
      sprintSummaryPassed = false;
      sprintIssues.push(`history.md chưa đồng bộ mục [Đang Thực Hiện] cho ${currentSprint}`);
    }
  }
}

// Đảm bảo không còn Sprint 4 hoặc Sprint 5 nằm trong [Kế Hoạch Tiếp Theo]
if (/## \[Kế Hoạch Tiếp Theo\].*?Sprint [1-5]/s.test(historyContent)) {
  sprintSummaryPassed = false;
  sprintIssues.push('history.md vẫn còn chứa các Sprint cũ (Sprint 1-5) trong mục [Kế Hoạch Tiếp Theo]!');
}

results.push({
  name: 'Kiểm tra trạng thái tổng kết Sprint ở cuối history.md',
  passed: sprintSummaryPassed,
  message: sprintSummaryPassed
    ? `Trạng thái Sprint ở cuối history.md đồng bộ chính xác với ${currentSprint || 'Task.md'}.`
    : `Phát hiện lỗi thời ở phần tổng kết Sprint: ${sprintIssues.join('; ')}`
});

// 4. Kiểm tra Database Schemas trong project_context.md
const tablesInContextMatches = contextContent.match(/^\d+\.\s+`([a-z0-9_]+)`/gm);
const declaredTableCount = tablesInContextMatches ? tablesInContextMatches.length : 0;

// Hệ thống ShopFlow hiện tại chuẩn hóa 15 bảng quan hệ ACID
const expectedMinimumTables = 15;
const schemaCheckPassed = declaredTableCount >= expectedMinimumTables;

results.push({
  name: 'Kiểm tra Bản đồ Dữ liệu (Database Schema) trong project_context.md',
  passed: schemaCheckPassed,
  message: schemaCheckPassed
    ? `project_context.md đã ghi nhận đầy đủ ${declaredTableCount} bảng quan hệ ACID (chuẩn >= ${expectedMinimumTables} bảng).`
    : `project_context.md chỉ mới liệt kê ${declaredTableCount}/${expectedMinimumTables} bảng! Cần cập nhật các bảng mới.`
});

// 5. Kiểm tra danh mục màn hình Frontend trong project_context.md
const expectedDashboardScreens = ['pages', 'automation', 'posts', 'inbox', 'orders', 'analytics', 'customers'];
const missingScreens: string[] = [];

if (fs.existsSync(FRONTEND_APP_DIR)) {
  const existingFolders = fs.readdirSync(FRONTEND_APP_DIR, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory() && !dirent.name.startsWith('_') && !dirent.name.startsWith('.'))
    .map(dirent => dirent.name);

  for (const screen of expectedDashboardScreens) {
    if (existingFolders.includes(screen)) {
      const screenPattern = new RegExp(`\\(dashboard\\)/${screen}`, 'i');
      if (!screenPattern.test(contextContent)) {
        missingScreens.push(screen);
      }
    }
  }
}

results.push({
  name: 'Kiểm tra danh mục màn hình Frontend trong project_context.md',
  passed: missingScreens.length === 0,
  message: missingScreens.length === 0
    ? `project_context.md đã cập nhật đầy đủ toàn bộ các màn hình dashboard (${expectedDashboardScreens.join(', ')}).`
    : `project_context.md thiếu các màn hình thực tế: ${missingScreens.join(', ')}`
});

// 6. Kiểm tra cấu trúc ADRs trong decisions.md
const adrHeaders = decisionsContent.match(/^## ADR-\d+:/gm) || [];
const adrCount = adrHeaders.length;

let adrFormatValid = true;
const adrIssues: string[] = [];

// Mỗi ADR phải có các trường Bối cảnh, Quyết định, Hệ quả
const adrBlocks = decisionsContent.split(/^## ADR-/gm).slice(1);
for (let i = 0; i < adrBlocks.length; i++) {
  const block = adrBlocks[i];
  const adrNum = block.substring(0, 3);
  if (!block.includes('Bối cảnh:') || !block.includes('Quyết định:') || !block.includes('Hệ quả:')) {
    adrFormatValid = false;
    adrIssues.push(`ADR-${adrNum} thiếu một trong các mục bắt buộc (Bối cảnh / Quyết định / Hệ quả)`);
  }
}

results.push({
  name: 'Kiểm tra chuẩn mực Architecture Decision Records (decisions.md)',
  passed: adrFormatValid && adrCount >= 18,
  message: (adrFormatValid && adrCount >= 18)
    ? `decisions.md chứa ${adrCount} ADRs hợp lệ, đầy đủ cấu trúc Bối cảnh - Quyết định - Hệ quả.`
    : `decisions.md có vấn đề: ${adrIssues.join('; ')} (Hiện có ${adrCount} ADRs, kỳ vọng >= 18 ADRs).`
});

// Xuất báo cáo kết quả
printReportAndExit();

function printReportAndExit() {
  let allPassed = true;

  for (const r of results) {
    const icon = r.passed ? '✅' : '❌';
    console.log(`${icon} [${r.passed ? 'PASS' : 'FAIL'}] ${r.name}`);
    console.log(`   └─ ${r.message}\n`);
    if (!r.passed) {
      allPassed = false;
    }
  }

  console.log('------------------------------------------------------');
  if (allPassed) {
    console.log('🎉 TẤT CẢ TIÊU CHÍ BỘ NHỚ ĐỀU ĐẠT CHUẨN (100% PASS)!');
    console.log('   Bộ ba memory (.agents/memory/) hoàn toàn nhất quán với dự án.\n');
    process.exit(0);
  } else {
    console.error('⚠️  CẢNH BÁO: BỘ NHỚ DỰ ÁN ĐANG BỊ LỆCH PHA (OUT-OF-SYNC)!');
    console.error('   Vui lòng đồng bộ các tệp trong .agents/memory/ trước khi triển khai hoặc push code.\n');
    process.exit(1);
  }
}
