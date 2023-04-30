import React from 'react'
import { useTheme } from '@mui/material'

const Triangle: React.FC = () => {
  const theme = useTheme()
  const color = theme.palette.primary.main
  return (
    <>
      <div style={{ position: 'absolute', top: '60%', left: '20%' }}>
        <svg width='400' height='250'>
          <rect
            x='0'
            y='0'
            width='220'
            height='220'
            rx='40%'
            ry='50%'
            style={{
              fill: `${color}`
            }}
          >
            <animate attributeName='x' from='0' to='20' dur='10s' repeatCount='indefinite' values='0; 20; 0' />
            <animate attributeName='y' from='0' to='20' dur='12s' repeatCount='indefinite' values='0; 20; 0' />
          </rect>
        </svg>
      </div>
      <div style={{ position: 'absolute', right: '15%', top: '20%' }}>
        <svg width='400' height='400'>
          <polygon
            points='190,20 60,359 320,239'
            style={{
              paddingTop: '100px',
              fill: `${color}`,
              stroke: `${color}`,
              strokeWidth: 2,
              borderRadius: '77% 23% 26% 81% '
            }}
          >
            <animateTransform
              attributeName='transform'
              attributeType='XML'
              type='rotate'
              from='0 190 190'
              to='360 190 190'
              dur='30s'
              repeatCount='indefinite'
            />
          </polygon>
        </svg>
      </div>
      <div style={{ position: 'absolute', top: '20%', left: '15%' }}>
        <svg width='400' height='400'>
          <rect
            x='0'
            y='0'
            width='180'
            height='180'
            rx='77%'
            ry='23% 26% 81% 64% 32% 72% 30%'
            style={{
              fill: `${color}`,
              stroke: `${color}`,
              strokeWidth: 2,
              position: 'relative',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <animate attributeName='x' from='0' to='20' dur='10s' repeatCount='indefinite' values='0; 20; 0' />
            <animate attributeName='y' from='0' to='20' dur='12s' repeatCount='indefinite' values='0; 20; 0' />
          </rect>
        </svg>
      </div>

      <svg width='300' height='200' style={{ position: 'absolute', top: '60%', left: '75%' }}>
        <polygon
          points='190,20 60,359 320,239'
          style={{
            paddingTop: '100px',
            fill: `${color}`,
            stroke: `${color}`,
            strokeWidth: 2,
            borderRadius: '100% 23% 26% 81% ',
            animation: 'move 20s linear infinite',
            transformOrigin: '90px 90px'
          }}
        />
        <style>
          {`
          @keyframes move {
            0% { transform: translateY(0); }
            50% { transform: translateY(100px); }
            100% { transform: translateY(0); }
          }
        `}
        </style>
      </svg>
    </>
  )
}

export default Triangle
