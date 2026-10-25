import { Link } from 'react-router-dom'
import {
  ROADMAP_LAYERS,
  ROADMAP_TRACKS,
  roadmapSummary,
  type RoadmapItem,
  type RoadmapItemStatus,
  type RoadmapTrack,
} from '../content/roadmap'

const STATUS_LABEL: Record<RoadmapItemStatus, { glyph: string; text: string }> = {
  ready: { glyph: '●', text: '학습 가능' },
  building: { glyph: '◐', text: '진행 중' },
  planned: { glyph: '○', text: '예정' },
}

function RoadmapEntry({ item }: { item: RoadmapItem }) {
  const status = STATUS_LABEL[item.status]
  return (
    <li className={`roadmap-item is-${item.status}`}>
      <span className="roadmap-glyph" aria-hidden="true">{status.glyph}</span>
      <span className="sr-only">{status.text}: </span>
      {item.href ? <Link to={item.href}>{item.title}</Link> : <span>{item.title}</span>}
      {item.origin === 'new' && <abbr className="roadmap-new" title="rf-wiki에 없던 새 주제">NEW</abbr>}
    </li>
  )
}

function TrackCard({ track }: { track: RoadmapTrack }) {
  const ready = track.items.filter((item) => item.status === 'ready').length
  const groups = [...new Set(track.items.map((item) => item.group ?? ''))]

  return (
    <article className="track-card" aria-labelledby={`track-${track.id}`}>
      <header className="track-head">
        <span className="track-number">{String(track.number).padStart(2, '0')}</span>
        <div>
          <h2 id={`track-${track.id}`}>{track.title}</h2>
          <p>{track.question}</p>
        </div>
        <span className="track-count" aria-label={`${track.items.length}개 중 ${ready}개 학습 가능`}>
          {ready} / {track.items.length}
        </span>
      </header>
      <div className="meter" aria-hidden="true"><i style={{ width: `${(ready / track.items.length) * 100}%` }} /></div>
      {groups.map((group) => (
        <div key={group || 'all'} className="track-group">
          {group && <h3>{group}</h3>}
          <ul>
            {track.items.filter((item) => (item.group ?? '') === group).map((item) => <RoadmapEntry key={item.id} item={item} />)}
          </ul>
        </div>
      ))}
    </article>
  )
}

export function HomePage() {
  const summary = roadmapSummary()

  return (
    <div className="home">
      <header className="home-header">
        <div className="home-header-inner">
          <div className="home-brand">
            <span className="brand-mark" aria-hidden="true">RF</span>
            <span>STUDY LAB / ROADMAP</span>
          </div>
          <h1>RF Study Lab</h1>
          <p className="home-lede">좋은 RF 테스트 프로그램을 만들기 위한 지식 지도입니다. 아래층이 위층의 기초이고, 항목을 하나씩 채워 갑니다.</p>
          <dl className="home-stats">
            <div><dt>학습 가능</dt><dd>{summary.ready} <small>/ {summary.core}</small></dd></div>
            <div><dt>진행 중</dt><dd>{summary.building}</dd></div>
            <div><dt>후순위 후보</dt><dd>{summary.later}</dd></div>
          </dl>
          <ul className="home-legend" aria-label="표시 설명">
            <li><span aria-hidden="true">●</span> 학습 가능</li>
            <li><span aria-hidden="true">◐</span> 진행 중</li>
            <li><span aria-hidden="true">○</span> 예정</li>
            <li><abbr className="roadmap-new">NEW</abbr> rf-wiki에 없던 새 주제</li>
          </ul>
        </div>
      </header>

      <main id="main-content" className="home-map">
        {ROADMAP_LAYERS.map((layer) => {
          const tracks = ROADMAP_TRACKS.filter((track) => track.layer === layer.id)
          return (
            <section key={layer.id} className={`home-layer is-${layer.id}`} aria-label={layer.label}>
              <div className="home-layer-label">{layer.label}</div>
              <div className="home-layer-tracks">
                {tracks.map((track) => <TrackCard key={track.id} track={track} />)}
              </div>
            </section>
          )
        })}
      </main>
    </div>
  )
}
