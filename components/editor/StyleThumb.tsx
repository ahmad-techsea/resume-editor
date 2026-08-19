import React from 'react';

/** The style-picker thumbnails, shared by the add-section grid and the per-section restyle popover. */
export default function StyleThumb({ st }: { st: any }) {
  return (
    <div style={{ height: '56px', overflow: 'hidden', pointerEvents: 'none', marginBottom: '7px' }}>
      {st.cCl && (
        <div>
          <div
            style={{
              fontSize: '7px',
              fontWeight: '700',
              letterSpacing: '.12em',
              color: 'var(--acc,#3E5C76)',
              borderBottom: '1px solid #E6E2DA',
              paddingBottom: '3px',
            }}
          >
            HEADING
          </div>
          <div
            style={{ height: '4px', background: '#E3DFD7', borderRadius: '2px', marginTop: '8px' }}
          />
          <div
            style={{
              height: '4px',
              background: '#E3DFD7',
              borderRadius: '2px',
              marginTop: '4px',
              width: '92%',
            }}
          />
          <div
            style={{
              height: '4px',
              background: '#E3DFD7',
              borderRadius: '2px',
              marginTop: '4px',
              width: '58%',
            }}
          />
        </div>
      )}
      {st.cSd && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '34px 1fr',
            gap: '8px',
            paddingTop: '4px',
          }}
        >
          <div
            style={{
              fontSize: '7px',
              fontWeight: '700',
              letterSpacing: '.1em',
              color: 'var(--acc,#3E5C76)',
            }}
          >
            HEAD
          </div>
          <div>
            <div style={{ height: '4px', background: '#E3DFD7', borderRadius: '2px' }} />
            <div
              style={{
                height: '4px',
                background: '#E3DFD7',
                borderRadius: '2px',
                marginTop: '4px',
                width: '90%',
              }}
            />
            <div
              style={{
                height: '4px',
                background: '#E3DFD7',
                borderRadius: '2px',
                marginTop: '4px',
                width: '62%',
              }}
            />
          </div>
        </div>
      )}
      {st.cTn && (
        <div
          style={{
            background: 'color-mix(in oklab,var(--acc,#3E5C76) 6%,#fff)',
            borderRadius: '6px',
            padding: '7px 8px',
          }}
        >
          <div
            style={{
              fontSize: '7px',
              fontWeight: '700',
              letterSpacing: '.12em',
              color: 'var(--acc,#3E5C76)',
            }}
          >
            HEADING
          </div>
          <div
            style={{ height: '4px', background: '#DFDAD1', borderRadius: '2px', marginTop: '6px' }}
          />
          <div
            style={{
              height: '4px',
              background: '#DFDAD1',
              borderRadius: '2px',
              marginTop: '4px',
              width: '78%',
            }}
          />
        </div>
      )}
      {st.cEd && (
        <div
          style={{
            borderTop: '1px solid #E6E2DA',
            borderBottom: '1px solid #E6E2DA',
            padding: '8px 0',
            marginTop: '4px',
          }}
        >
          <div style={{ height: '5px', background: '#C9C4BB', borderRadius: '2px' }} />
          <div
            style={{
              height: '5px',
              background: '#C9C4BB',
              borderRadius: '2px',
              marginTop: '5px',
              width: '84%',
            }}
          />
          <div
            style={{
              height: '5px',
              background: '#C9C4BB',
              borderRadius: '2px',
              marginTop: '5px',
              width: '52%',
            }}
          />
        </div>
      )}
      {st.cCe && (
        <div>
          <div
            style={{
              fontSize: '7px',
              fontWeight: '700',
              letterSpacing: '.12em',
              color: 'var(--acc,#3E5C76)',
              borderBottom: '1px solid #E6E2DA',
              paddingBottom: '3px',
              textAlign: 'left',
            }}
          >
            HEADING
          </div>
          <div
            style={{
              height: '4px',
              background: '#E3DFD7',
              borderRadius: '2px',
              margin: '14px auto 0',
              width: '55%',
            }}
          />
        </div>
      )}
      {st.cPl && (
        <div>
          <div
            style={{
              fontSize: '7px',
              fontWeight: '700',
              letterSpacing: '.12em',
              color: 'var(--acc,#3E5C76)',
              borderBottom: '1px solid #E6E2DA',
              paddingBottom: '3px',
            }}
          >
            HEADING
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px', marginTop: '7px' }}>
            <span
              style={{
                width: '34px',
                height: '11px',
                border: '1px solid #D8D4CC',
                borderRadius: '999px',
              }}
            />
            <span
              style={{
                width: '26px',
                height: '11px',
                border: '1px solid #D8D4CC',
                borderRadius: '999px',
              }}
            />
            <span
              style={{
                width: '40px',
                height: '11px',
                border: '1px solid #D8D4CC',
                borderRadius: '999px',
              }}
            />
            <span
              style={{
                width: '30px',
                height: '11px',
                border: '1px solid #D8D4CC',
                borderRadius: '999px',
              }}
            />
            <span
              style={{
                width: '22px',
                height: '11px',
                border: '1px solid #D8D4CC',
                borderRadius: '999px',
              }}
            />
          </div>
        </div>
      )}
      {st.eCl && (
        <div style={{ paddingTop: '2px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div
              style={{ height: '5px', background: '#B9B3A9', borderRadius: '2px', width: '55%' }}
            />
            <div
              style={{ height: '4px', background: '#E3DFD7', borderRadius: '2px', width: '36px' }}
            />
          </div>
          <div
            style={{
              height: '4px',
              background: '#E3DFD7',
              borderRadius: '2px',
              marginTop: '5px',
              width: '44%',
            }}
          />
          <div
            style={{ height: '4px', background: '#E3DFD7', borderRadius: '2px', marginTop: '7px' }}
          />
          <div
            style={{
              height: '4px',
              background: '#E3DFD7',
              borderRadius: '2px',
              marginTop: '4px',
              width: '86%',
            }}
          />
        </div>
      )}
      {st.eTl && (
        <div
          style={{
            borderLeft: '2px solid #E6E2DA',
            paddingLeft: '9px',
            position: 'relative',
            marginTop: '2px',
            marginLeft: '3px',
          }}
        >
          <span
            style={{
              position: 'absolute',
              left: '-4px',
              top: '1px',
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: 'var(--acc,#3E5C76)',
            }}
          />
          <div
            style={{ height: '3.5px', background: '#E3DFD7', borderRadius: '2px', width: '38px' }}
          />
          <div
            style={{
              height: '5px',
              background: '#B9B3A9',
              borderRadius: '2px',
              marginTop: '5px',
              width: '70%',
            }}
          />
          <div
            style={{
              height: '4px',
              background: '#E3DFD7',
              borderRadius: '2px',
              marginTop: '5px',
              width: '88%',
            }}
          />
          <div
            style={{
              height: '4px',
              background: '#E3DFD7',
              borderRadius: '2px',
              marginTop: '4px',
              width: '60%',
            }}
          />
        </div>
      )}
      {st.eDl && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '34px 1fr',
            gap: '7px',
            paddingTop: '3px',
          }}
        >
          <div>
            <div style={{ height: '3.5px', background: '#E3DFD7', borderRadius: '2px' }} />
            <div
              style={{
                height: '3.5px',
                background: '#E3DFD7',
                borderRadius: '2px',
                marginTop: '4px',
                width: '80%',
              }}
            />
          </div>
          <div>
            <div
              style={{ height: '5px', background: '#B9B3A9', borderRadius: '2px', width: '75%' }}
            />
            <div
              style={{
                height: '4px',
                background: '#E3DFD7',
                borderRadius: '2px',
                marginTop: '5px',
                width: '55%',
              }}
            />
            <div
              style={{
                height: '4px',
                background: '#E3DFD7',
                borderRadius: '2px',
                marginTop: '6px',
              }}
            />
          </div>
        </div>
      )}
      {st.eCp && (
        <div style={{ paddingTop: '3px' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '5px 0',
              borderBottom: '1px solid #F0EDE7',
            }}
          >
            <div
              style={{ height: '4.5px', background: '#B9B3A9', borderRadius: '2px', width: '58%' }}
            />
            <div
              style={{ height: '3.5px', background: '#E3DFD7', borderRadius: '2px', width: '28px' }}
            />
          </div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '6px 0',
            }}
          >
            <div
              style={{ height: '4.5px', background: '#B9B3A9', borderRadius: '2px', width: '48%' }}
            />
            <div
              style={{ height: '3.5px', background: '#E3DFD7', borderRadius: '2px', width: '28px' }}
            />
          </div>
        </div>
      )}
      {st.eCf && (
        <div style={{ paddingTop: '2px' }}>
          <div
            style={{
              fontSize: '6.5px',
              fontWeight: '700',
              letterSpacing: '.11em',
              color: 'var(--acc,#3E5C76)',
            }}
          >
            COMPANY
          </div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: '4px',
            }}
          >
            <div
              style={{ height: '5.5px', background: '#8F897F', borderRadius: '2px', width: '58%' }}
            />
            <div
              style={{ height: '4px', background: '#E3DFD7', borderRadius: '2px', width: '34px' }}
            />
          </div>
          <div
            style={{ height: '4px', background: '#E3DFD7', borderRadius: '2px', marginTop: '7px' }}
          />
          <div
            style={{
              height: '4px',
              background: '#E3DFD7',
              borderRadius: '2px',
              marginTop: '4px',
              width: '70%',
            }}
          />
        </div>
      )}
    </div>
  );
}
