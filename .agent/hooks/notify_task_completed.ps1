# Script: notify_task_completed.ps1
# Phát âm thanh thông báo "ting" khi AI Agent hoàn thành tác vụ (Stop event)

try {
    # Ưu tiên file âm thanh Windows Ding quen thuộc
    $soundPath = "C:\Windows\Media\Windows Ding.wav"
    if (-not (Test-Path $soundPath)) {
        $soundPath = "C:\Windows\Media\ding.wav"
    }

    if (Test-Path $soundPath) {
        $player = New-Object System.Media.SoundPlayer $soundPath
        $player.PlaySync()
    } else {
        [System.Media.SystemSounds]::Asterisk.Play()
    }
} catch {
    # Fallback nếu thiết bị audio có độ trễ
    try { [System.Console]::Beep(1000, 250) } catch {}
}

# Xuất kết quả JSON hợp lệ ra stdout cho Antigravity Engine
Write-Output '{"decision": "allow"}'
