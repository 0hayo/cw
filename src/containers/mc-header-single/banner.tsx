import React, { FC } from "react";
import Logo from "images/logo/company-logo.svg";
// import AppLogo from "images/logo/app-logo.png";

const McHeaderBanner: FC = () => {
  return (
    <div className="header_bgc">
      <div className="header_dev">
        <div className="header_list">
          <div className="mc-logo">
            <img src={Logo} alt="LOGO" />
          </div>
        </div>
        {/* <div className="mc-divider"></div> */}
        <div className="mc-header__title-text">智能收发报系统</div>
        {/* <div className="mc-divider"></div> */}
        {/* <div className="mc-app-logo">
          <img src={AppLogo} alt="LOGO" />
        </div> */}
      </div>
    </div>
  );
};

export default McHeaderBanner;
