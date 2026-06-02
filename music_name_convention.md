# Music Name Convention

Quy ước đặt tên file nhạc dùng cho BGM/video automation.

## Format

```txt
[mood]_[style]_[vocal]_[speed]_[duration]_[note].mp3
```

## Fields

```txt
mood     = chill | tension | funny | sad | mystery | dark | inspiring | romantic | epic | neutral
style    = lofi | piano | ambient | cinematic | ukulele | electronic | orchestral | synth | acoustic
vocal    = no-vocal | vocal | humming | choir | speech-sample
speed    = slow | medium | fast | <number>bpm
duration = <minutecount>m<secondcount>s
note     = any, lowercase, use "-" not "_"
```

## Field meaning

### mood

Cảm xúc chính của nhạc.

```txt
chill      = nhẹ, thư giãn
tension    = căng thẳng, drama
funny      = hài, meme
sad        = buồn, cảm xúc
mystery    = bí ẩn, điều tra
dark       = tối, nặng, u ám
inspiring  = truyền cảm hứng
romantic   = tình cảm
epic       = hoành tráng
neutral    = trung tính, kể chuyện bình thường
```

### style

Phong cách/nhạc cụ/chất âm chính.

```txt
lofi        = lofi beat
piano       = piano
ambient     = nền không khí
cinematic   = điện ảnh
ukulele     = vui nhẹ, acoustic nhỏ
electronic  = điện tử
orchestral  = dàn nhạc
synth       = synth/synthwave
acoustic    = mộc, guitar/nhạc cụ thật
```

### vocal

Có giọng/người hát hay không.

```txt
no-vocal       = không vocal, phù hợp làm nền thoại
vocal          = có hát/giọng rõ
humming        = ngân nga
choir          = hợp xướng
speech-sample  = có sample giọng nói
```

### speed

Tốc độ cảm giác hoặc BPM cụ thể.

```txt
slow
medium
fast
90bpm
100bpm
120bpm
```

### duration

Độ dài file theo format:

```txt
<minutecount>m<secondcount>s
```

Ví dụ:

```txt
0m12s
0m30s
1m00s
1m15s
2m00s
```

### note

Ghi chú tự do, nhưng phải giữ sạch để dễ parse bằng code.

Rules:

```txt
- lowercase
- dùng "-" thay vì "_"
- không dùng khoảng trắng
- không dùng ký tự đặc biệt
```

Ví dụ note tốt:

```txt
loop
clean-loop
rising-drama
meme-short
soft-ending
creepy-light
intro
outro
dramatic-hit
```

Không nên:

```txt
rising_drama
soft ending
CreepyLight
loop!!!
```

## Examples

```txt
neutral_ambient_no-vocal_slow_1m30s_clean-loop.mp3
chill_lofi_no-vocal_90bpm_0m30s_loop.mp3
tension_cinematic_no-vocal_100bpm_0m45s_rising-drama.mp3
funny_ukulele_no-vocal_fast_0m12s_meme-short.mp3
sad_piano_humming_slow_2m00s_soft-ending.mp3
mystery_ambient_no-vocal_medium_0m45s_creepy-light.mp3
epic_orchestral_choir_120bpm_1m00s_trailer-hit.mp3
```

## Regex validation

```regex
^(chill|tension|funny|sad|mystery|dark|inspiring|romantic|epic|neutral)_(lofi|piano|ambient|cinematic|ukulele|electronic|orchestral|synth|acoustic)_(no-vocal|vocal|humming|choir|speech-sample)_(slow|medium|fast|\d+bpm)_(\d+m\d{2}s)_[a-z0-9-]+\.mp3$
```

## Parsing idea

```ts
const fileName = "tension_cinematic_no-vocal_100bpm_0m45s_rising-drama.mp3";

const [mood, style, vocal, speed, duration, noteWithExt] = fileName.split("_");
const note = noteWithExt.replace(".mp3", "");

console.log({ mood, style, vocal, speed, duration, note });
```

## Recommended folder

```txt
music/
  bgm/
    neutral_ambient_no-vocal_slow_1m30s_clean-loop.mp3
    tension_cinematic_no-vocal_100bpm_0m45s_rising-drama.mp3
  loop/
  intro/
  outro/
  stinger/
```

## Main rule

Tên file phải giúp code và người dựng video hiểu nhanh:

```txt
mood + style + vocal + speed + duration + usage note
```
