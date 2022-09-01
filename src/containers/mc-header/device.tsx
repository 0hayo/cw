import React, { FC } from "react";
// import Earphone from "images/home/Earphone.png";
// import microphone from "images/home/microphone.png";
// import Photograph from "images/home/Photograph.png";
// import Printer from "images/home/Printer.png";
import McClock from "components/mc-clock";

const McHeaderDev: FC = () => {
  return (
    <div className="header_bgc">
      <div className="header_dev">
        <div className="header_list">
          <McClock />
        </div>
        {/* <div className="header_list">
          <img src={Earphone} alt="" />
        </div>
        <div className="header_list">
          <img src={microphone} alt="" />
        </div>
        <div className="header_list">
          <img src={Photograph} alt="" />
        </div>
        <div className="header_list">
          <img src={Printer} alt="" />
        </div> */}
      </div>
    </div>
  );
};

export default McHeaderDev;
