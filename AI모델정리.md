ollama
qwen3.5:35b-a3b qwen3.5-35b-64k

연결 IP : http://82.178.70.67:40770
모델 : qwen3.5:35b-a3b : Q4베이스, qwen3.5:35b-a3b-q6_k: Q6베이스, qwen3.5:35b-a3b-q8_0: Q8베이스 (qwen3.5-35b-64k)


# shm에 Modelfile 생성
cat > /dev/shm/Modelfile << 'EOF'
FROM qwen3.5:35b-a3b-q8_0
PARAMETER num_ctx 65536
EOF

# shm의 Modelfile로 모델 생성
ollama create qwen3.5-35b-64k -f /dev/shm/Modelfile




# 인스턴스 생성 시 시작 스크립트 자동화
* 2x RTX 3090 vRAM: 48
* 인스턴스 생성 시 On-start script 입력란에: 인스턴스 뜰 때마다 자동 세팅! (~10분 소요)
```
#!/bin/bash
export TMPDIR=/dev/shm
export OLLAMA_MODELS=/dev/shm/ollama_models
export OLLAMA_TMPDIR=/dev/shm

# 모델 자동 pull
ollama pull qwen3.5:35b-a3b

# 64k 모델 자동 생성
cat > /dev/shm/Modelfile << 'EOF'
FROM qwen3.5:35b-a3b
PARAMETER num_ctx 65536
EOF
ollama create qwen3.5-35b-64k -f /dev/shm/Modelfile
```





# 나중에 인스턴스 자동화를 위한 순서---------------------------------------------------------------------
---
## Vast.ai qwen3.5-35b-64k 세팅 가이드

---

### 1단계: Vast.ai 인스턴스 생성

**Search 페이지에서:**
```
Template: Open Webui (Ollama)
GPU: 2x RTX 3090
Type: Interruptible
Region: Planet Earth (전세계)
Container Size: 60GB  ← 핵심!
```

**✏️ 연필 아이콘 → On-start Script 입력:**
```bash
#!/bin/bash
export TMPDIR=/dev/shm
export OLLAMA_MODELS=/dev/shm/ollama_models
export OLLAMA_TMPDIR=/dev/shm

echo "export TMPDIR=/dev/shm" >> ~/.bashrc
echo "export OLLAMA_MODELS=/dev/shm/ollama_models" >> ~/.bashrc
echo "export OLLAMA_TMPDIR=/dev/shm" >> ~/.bashrc

sleep 60

ollama pull qwen3.5:35b-a3b

cat > /dev/shm/Modelfile << 'EOF'
FROM qwen3.5:35b-a3b
PARAMETER num_ctx 65536
EOF

ollama create qwen3.5-35b-64k -f /dev/shm/Modelfile
echo "✅ 세팅 완료!"
```

**Create & Use 클릭**

---

### 2단계: 인스턴스 시작 후 대기 (~10분)

```
Instances 페이지에서 상태 확인
Status: success 될 때까지 대기
```

---

### 3단계: Bearer Token 확인

터미널(SSH) 접속 후:
```bash
curl -s http://localhost:2019/config/ | python3 -c "
import sys, re
cfg = sys.stdin.read()
tokens = re.findall(r'Bearer ([a-f0-9]{64})', cfg)
print(tokens[0] if tokens else 'not found')
"
```

---

### 4단계: GPU 및 모델 확인

```bash
export TMPDIR=/dev/shm
export OLLAMA_MODELS=/dev/shm/ollama_models

# GPU 확인
ollama list

# Supervisor 확인
supervisorctl status ollama
```

**ollama RUNNING + 모델 목록 나오면 성공!**

---

### 5단계: AXIOM AI 연결

```
엔드포인트 URL: http://[IP]:[Ollama외부포트]
모델명: qwen3.5-35b-64k
API 키: [3단계에서 나온 토큰]
Temperature: 0.2
Max Tokens: 4096
```

**Ollama 외부 포트 확인:**
```
Vast.ai → Instance → Open → Applications
→ Ollama API → Advanced Connection Options
→ Port: 11434 → [이 숫자]
```

---

### 재시작 시 주의사항

> ⚠️ **Interruptible 인스턴스가 끊기면**
> - shm 모델 사라짐
> - On-start Script 자동 실행됨 (~10분 대기)
> - Bearer Token은 유지됨
> - AXIOM AI 설정 그대로 사용 가능

---

### 비용 정리

| 상황 | 요금 |
|---|---|
| Interruptible | $0.009~0.05/hr |
| On-Demand | $0.5~1.0/hr |
| Stop 상태 | $0 |

**테스트 끝나면 반드시 Stop 또는 Delete!** 🚀