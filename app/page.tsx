"use client";

import Image from "next/image";
import { PointerEvent, useEffect, useRef, useState } from "react";

type WishRecord = {
  wish: string;
  madeAt: string;
};

type SaveState = "idle" | "saving" | "saved" | "error";

function WillowHalf({
  side,
  progress,
  broken,
}: {
  side: "left" | "right";
  progress: number;
  broken: boolean;
}) {
  return (
    <span
      className={`willow-half willow-${side} ${broken ? "is-broken" : ""}`}
      style={{ "--strain": progress } as React.CSSProperties}
      aria-hidden="true"
    >
      <Image
        src="/willow-real.png"
        alt=""
        width={1536}
        height={500}
        unoptimized
        draggable={false}
      />
    </span>
  );
}

export default function Home() {
  const [wish, setWish] = useState("");
  const [record, setRecord] = useState<WishRecord | null>(null);
  const [ready, setReady] = useState(false);
  const [holding, setHolding] = useState(false);
  const [progress, setProgress] = useState(0);
  const [broken, setBroken] = useState(false);
  const [soundOn, setSoundOn] = useState(false);
  const [visitorCount, setVisitorCount] = useState<number | null>(null);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const frameRef = useRef<number | null>(null);
  const startRef = useRef(0);
  const musicRef = useRef<HTMLAudioElement | null>(null);
  const fadeRef = useRef<number | null>(null);
  const visitorIdRef = useRef<string | null>(null);

  useEffect(() => {
    ["one-wish-willow-v1", "one-wish-willow-v2", "one-wish-willow-v3"].forEach(
      (key) => window.localStorage.removeItem(key),
    );
    const audio = musicRef.current;
    if (audio) {
      audio.volume = 0.42;
      void audio
        .play()
        .then(() => setSoundOn(true))
        .catch(() => setSoundOn(false));
    }
    return () => {
      if (fadeRef.current) cancelAnimationFrame(fadeRef.current);
      audio?.pause();
    };
  }, []);

  useEffect(() => {
    const visitorKey = "one-wish-willow-visitor";
    let visitorId = window.localStorage.getItem(visitorKey);
    if (!visitorId) {
      visitorId = window.crypto.randomUUID();
      window.localStorage.setItem(visitorKey, visitorId);
    }
    visitorIdRef.current = visitorId;

    void fetch("/api/visitors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ visitorId }),
    })
      .then((response) => {
        if (!response.ok) throw new Error("visitor count unavailable");
        return response.json() as Promise<{ visitors: number }>;
      })
      .then((data) => setVisitorCount(data.visitors))
      .catch(() => setVisitorCount(null));
  }, []);

  const saveWish = async (nextRecord: WishRecord) => {
    const visitorId = visitorIdRef.current;
    if (!visitorId) {
      setSaveState("error");
      return;
    }

    setSaveState("saving");
    try {
      const response = await fetch("/api/wishes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visitorId, wish: nextRecord.wish }),
      });
      if (!response.ok) throw new Error("wish save unavailable");
      setSaveState("saved");
    } catch {
      setSaveState("error");
    }
  };

  const fadeMusic = (
    audio: HTMLAudioElement,
    from: number,
    to: number,
    duration: number,
    onDone?: () => void,
  ) => {
    if (fadeRef.current) cancelAnimationFrame(fadeRef.current);
    const startedAt = performance.now();
    audio.volume = from;

    const step = (now: number) => {
      const amount = Math.min((now - startedAt) / duration, 1);
      audio.volume = from + (to - from) * amount;
      if (amount < 1) {
        fadeRef.current = requestAnimationFrame(step);
      } else {
        fadeRef.current = null;
        onDone?.();
      }
    };
    fadeRef.current = requestAnimationFrame(step);
  };

  const toggleAmbient = () => {
    const audio = musicRef.current;
    if (!audio) return;

    if (!audio.paused) {
      setSoundOn(false);
      fadeMusic(audio, audio.volume, 0, 650, () => audio.pause());
      return;
    }

    audio.volume = 0;
    void audio.play().then(() => {
      setSoundOn(true);
      fadeMusic(audio, 0, 0.42, 1400);
    });
  };

  const playCrack = () => {
    const AudioContextClass =
      window.AudioContext ||
      (window as typeof window & { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!AudioContextClass) return;

    const context = new AudioContextClass();
    const duration = 0.28;
    const buffer = context.createBuffer(
      1,
      context.sampleRate * duration,
      context.sampleRate,
    );
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i += 1) {
      const decay = Math.pow(1 - i / data.length, 4);
      data[i] = (Math.random() * 2 - 1) * decay;
    }
    const source = context.createBufferSource();
    const filter = context.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = 1250;
    filter.Q.value = 0.75;
    source.buffer = buffer;
    source.connect(filter);
    filter.connect(context.destination);
    source.start();
    window.setTimeout(() => context.close(), 600);
  };

  const completeWish = () => {
    if (broken || !wish.trim()) return;
    const nextRecord = {
      wish: wish.trim(),
      madeAt: new Date().toISOString(),
    };
    if (frameRef.current) cancelAnimationFrame(frameRef.current);
    setHolding(false);
    setProgress(1);
    setBroken(true);
    setRecord(nextRecord);
    void saveWish(nextRecord);
    navigator.vibrate?.([35, 35, 90]);
    playCrack();
  };

  const stopHolding = () => {
    if (frameRef.current) cancelAnimationFrame(frameRef.current);
    frameRef.current = null;
    setHolding(false);
    if (!broken) setProgress(0);
  };

  const beginHolding = (event: PointerEvent<HTMLButtonElement>) => {
    if (!ready || broken || !wish.trim()) return;
    if (frameRef.current) cancelAnimationFrame(frameRef.current);
    event.currentTarget.setPointerCapture(event.pointerId);
    setHolding(true);
    startRef.current = performance.now();

    const tick = (now: number) => {
      const next = Math.min((now - startRef.current) / 1600, 1);
      setProgress(next);
      if (next >= 1) {
        completeWish();
        return;
      }
      frameRef.current = requestAnimationFrame(tick);
    };
    frameRef.current = requestAnimationFrame(tick);
  };

  const dateLabel = record
    ? new Intl.DateTimeFormat("zh-CN", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date(record.madeAt))
    : "";

  return (
    <main className={`ritual ${broken ? "ritual-complete" : ""}`}>
      <audio
        ref={musicRef}
        src="/two-by-four.mp3?v=music-2"
        loop
        autoPlay
        playsInline
        preload="auto"
        onPause={() => setSoundOn(false)}
        onPlay={() => setSoundOn(true)}
      />
      <div className="grain" aria-hidden="true" />
      <header className="topbar">
        <div className="brand-mark" aria-hidden="true">
          1
        </div>
        <div className="brand-copy">
          <span>ONLY ONE</span>
          <strong>ONE WISH WILLOW</strong>
        </div>
        <button
          type="button"
          className={`sound-toggle ${soundOn ? "sound-on" : ""}`}
          onClick={toggleAmbient}
          aria-pressed={soundOn}
        >
          <span className="sound-pulse" aria-hidden="true" />
          {soundOn ? "TWO BY FOUR · ON" : "播放 TWO BY FOUR"}
        </button>
        <div className="edition">NO. 01 / 01</div>
      </header>

      <section className="stage" aria-live="polite">
        <div className="intro">
          <p className="eyebrow">{broken ? "愿望已生效" : "只允许一个愿望"}</p>
          <h1>
            {broken ? (
              <>
                你已得到
                <br />
                <em>所愿之物</em>
              </>
            ) : (
              <>
                想清楚，
                <br />
                再<em>折断它</em>
              </>
            )}
          </h1>
          <p className="lead">
            {broken
              ? "ONE WISH WILLOW 已经折断。愿望不会因后悔而撤回。"
              : "写下唯一的愿望。握紧柳枝，直到它在你手中断裂。"}
          </p>
        </div>

        <div className="artifact-wrap">
          <div className="artifact-glow" aria-hidden="true" />
          <Image
            className="wish-box"
            src="/willow-box-real.png"
            alt="ONE WISH WILLOW 三角包装盒"
            width={1536}
            height={524}
            priority
            unoptimized
            draggable={false}
          />
          <button
            type="button"
            className={`artifact ${holding ? "is-holding" : ""}`}
            onPointerDown={beginHolding}
            onPointerUp={stopHolding}
            onPointerCancel={stopHolding}
            onContextMenu={(event) => event.preventDefault()}
            disabled={!ready || broken || !wish.trim()}
            aria-label="长按 1.6 秒折断 ONE WISH WILLOW"
          >
            <WillowHalf side="left" progress={progress} broken={broken} />
            <span
              className="crack-light"
              style={{ opacity: Math.max(0, (progress - 0.72) * 3.6) }}
              aria-hidden="true"
            />
            {broken && (
              <span className="crack-word" aria-hidden="true">
                CRACK!
              </span>
            )}
            <WillowHalf side="right" progress={progress} broken={broken} />
          </button>
          {!broken && (
            <div className="strain-meter" aria-hidden="true">
              <span style={{ width: `${progress * 100}%` }} />
            </div>
          )}
          <p className="artifact-caption">
            {holding
              ? "不要松手…"
              : broken
                ? "CRACKED · 无法复原"
                : "长按柳枝以折断"}
          </p>
        </div>

        <div className="wish-panel">
          {broken && record ? (
            <div className="sealed-wish">
              <span className="seal">WISH SEALED</span>
              <blockquote>“{record.wish}”</blockquote>
              <time>{dateLabel}</time>
              <p className={`save-state save-${saveState}`}>
                {saveState === "saving" && "正在封存愿望…"}
                {saveState === "saved" && "已匿名封存 · 仅站点主人可查看"}
                {saveState === "error" && (
                  <button type="button" onClick={() => void saveWish(record)}>
                    保存失败，点击重试
                  </button>
                )}
              </p>
            </div>
          ) : (
            <>
              <label htmlFor="wish">你的唯一愿望</label>
              <textarea
                id="wish"
                value={wish}
                maxLength={80}
                onChange={(event) => setWish(event.target.value)}
                placeholder="我希望……"
                rows={3}
              />
              <div className="field-meta">
                <span>匿名保存，仅站点主人可查看</span>
                <span>{wish.length}/80</span>
              </div>
              <label className="consent">
                <input
                  type="checkbox"
                  checked={ready}
                  onChange={(event) => setReady(event.target.checked)}
                />
                <span className="check-box" aria-hidden="true" />
                <span>我明白：愿望一经许下，不可撤销。</span>
              </label>
            </>
          )}
        </div>
      </section>

      <footer>
        <span>一次机会</span>
        <span className="footer-warning">谨慎措辞，后果自负</span>
        <span className="visitor-count">
          VISITORS {visitorCount === null ? "—" : visitorCount.toLocaleString()}
        </span>
      </footer>
    </main>
  );
}
