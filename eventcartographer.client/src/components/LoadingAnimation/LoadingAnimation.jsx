import cl from './.module.css';

export default function LoadingAnimation({ size = '120px', curveWidth = '16px', curveColor1 = '#00000000', curveColor2 = '#00000000' }) {
    return (
        <div className={cl.main}>
            <div className={cl.loader} style={{
            width: size,
            height: size,
            border: `${curveWidth} solid #00a193`,
            borderTop: `${curveWidth} solid #C99E22`,
            borderBottom: `${curveWidth} solid #C99E22`
            }}></div>
        </div>
    );
}