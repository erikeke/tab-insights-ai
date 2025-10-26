export const Tooltip = ({content, top, left, right, bottom}: {content: string, top?: string , left?: string, right?: string, bottom?: string}) => {
    return <div
    style={{
        position: "absolute",
        top: top ? top : undefined,
        left: left ? left : undefined,
        right: right ? right : undefined,
        bottom: bottom ? bottom : undefined,
        backgroundColor: "#333",
        padding: "4px 6px",
        borderRadius: "8px",  
        boxShadow: "0 3px 5px -2px #00000036, 0 4px 6px -1px #00000024",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "4px",
        color: "#FFF",
        textWrap: "nowrap",
        userSelect: "none",
        }}
    >{content}</div>
}