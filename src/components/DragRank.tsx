import React, { useState } from 'react';
import { ArrowUp, ArrowDown, GripVertical } from 'lucide-react';

interface RankItem {
  id: string;
  title: string;
  emoji: string;
}

interface DragRankProps {
  items: RankItem[];
  onChange: (items: RankItem[]) => void;
}

export const DragRank: React.FC<DragRankProps> = ({ items, onChange }) => {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Reorder list elements
  const reorder = (list: RankItem[], startIndex: number, endIndex: number) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    return result;
  };

  // Move item up
  const moveUp = (index: number) => {
    if (index === 0) return;
    const newItems = reorder(items, index, index - 1);
    onChange(newItems);
  };

  // Move item down
  const moveDown = (index: number) => {
    if (index === items.length - 1) return;
    const newItems = reorder(items, index, index + 1);
    onChange(newItems);
  };

  // Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    // Transparent drag preview styling
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    setHoveredIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setHoveredIndex(null);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault();
    if (draggedIndex === null) return;
    const newItems = reorder(items, draggedIndex, index);
    onChange(newItems);
    setDraggedIndex(null);
    setHoveredIndex(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%' }}>
      {items.map((item, index) => {
        const isDragged = draggedIndex === index;
        const isHovered = hoveredIndex === index;

        return (
          <div
            key={item.id}
            draggable
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragEnd={handleDragEnd}
            onDrop={(e) => handleDrop(e, index)}
            className={`draggable-item`}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '1rem',
              borderRadius: '16px',
              backgroundColor: isDragged
                ? 'var(--primary-light)'
                : isHovered
                ? 'var(--accent-light)'
                : 'var(--bg-card)',
              border: isDragged
                ? '2px dashed var(--primary)'
                : isHovered
                ? '2px solid var(--accent)'
                : '1.5px solid var(--border-color)',
              opacity: isDragged ? 0.6 : 1,
              transform: isDragged ? 'scale(0.98)' : 'scale(1)',
              boxShadow: isDragged ? 'none' : 'var(--shadow-sm)',
              transition: 'var(--transition-fast)',
              userSelect: 'none',
            }}
          >
            {/* Left Content: Rank Rank, Grip, Emoji, Title */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              {/* Rank Label */}
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--primary-light)',
                  color: 'var(--primary)',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {index + 1}
              </div>

              {/* Drag Handle Indicator */}
              <div style={{ display: 'flex', color: 'var(--text-muted)', cursor: 'grab' }}>
                <GripVertical size={18} />
              </div>

              {/* Title & Emoji */}
              <span style={{ fontSize: '1.35rem' }}>{item.emoji}</span>
              <span style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-main)' }}>
                {item.title}
              </span>
            </div>

            {/* Right Content: Click Reorder Fallbacks (Perfect for Mobile viewports) */}
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              <button
                type="button"
                onClick={() => moveUp(index)}
                disabled={index === 0}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  border: '1.5px solid var(--border-color)',
                  backgroundColor: '#fff',
                  color: index === 0 ? 'var(--border-color)' : 'var(--text-body)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: index === 0 ? 'not-allowed' : 'pointer',
                  transition: 'var(--transition-fast)',
                }}
                onMouseEnter={(e) => {
                  if (index !== 0) {
                    e.currentTarget.style.borderColor = 'var(--primary)';
                    e.currentTarget.style.color = 'var(--primary)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (index !== 0) {
                    e.currentTarget.style.borderColor = 'var(--border-color)';
                    e.currentTarget.style.color = 'var(--text-body)';
                  }
                }}
              >
                <ArrowUp size={16} />
              </button>

              <button
                type="button"
                onClick={() => moveDown(index)}
                disabled={index === items.length - 1}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  border: '1.5px solid var(--border-color)',
                  backgroundColor: '#fff',
                  color: index === items.length - 1 ? 'var(--border-color)' : 'var(--text-body)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: index === items.length - 1 ? 'not-allowed' : 'pointer',
                  transition: 'var(--transition-fast)',
                }}
                onMouseEnter={(e) => {
                  if (index !== items.length - 1) {
                    e.currentTarget.style.borderColor = 'var(--primary)';
                    e.currentTarget.style.color = 'var(--primary)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (index !== items.length - 1) {
                    e.currentTarget.style.borderColor = 'var(--border-color)';
                    e.currentTarget.style.color = 'var(--text-body)';
                  }
                }}
              >
                <ArrowDown size={16} />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};
