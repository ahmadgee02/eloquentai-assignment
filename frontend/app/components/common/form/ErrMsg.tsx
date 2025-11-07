
const Errormsg = (props: any) => {
    return <div style={{
        "color": "red",
        "textAlign": "start",
        "marginLeft": "3px",
        "fontSize": "12px",
        "letterSpacing": "1px",
        "marginTop": "5px"
    }}>{props.children}
    </div>;
};

export default Errormsg;
