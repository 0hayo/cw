import styled from "styled-components";

export const MstBody = styled.div`
  display: flex;
  width: 100%;
  height: 100%;
`;
export const MstDiv = styled.div.attrs(props => ({
  gap: props.gap,
}))`
  display: flex;
  gap: ${props => props.gap};
  padding: ${({ padding }) => (padding ? "20px" : "")};
  flex-direction: ${({ column }) => (column ? "column" : "row")};
  justify-content: ${({ spaceBetween }) => (spaceBetween ? "space-between" : "flex-start")};
  align-items: ${({ center }) => (center ? "center" : "flex-start")};
`;

export const MstHead = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  height: 60px;
  padding: 0 20px;
  font-size: 20px;
  border-bottom: 1px solid #000000;
  line-height: 60px;
  font-size: 20px;
  ${({ hover }) =>
    hover &&
    `&:hover{
      color: #24e059;
      cursor: pointer;
    }
    `}
`;

export const MstTitle = styled.span`
  font-size: 20px;
  line-height: 20px;
`;
export const MstText = styled.span`
  font-size: 14px;
  line-height: 20px;
`;

//多种button

export const MstBtn = styled.button.attrs(props => ({
  width: props.width || "100%",
  disabled: props.disabled || false,
}))`
  width: ${props => props.width};
  display: flex;
  justify-content: center;
  align-items: center;
  border: 1px solid #000000;
  gap: 10px;
  height: 44px;
  line-height: 44px;
  font-size: 18px;
  color: #fff;
  border-radius: 8px;
  background: #2e324e;

  &:focus {
    outline: none;
  }
  ${props =>
    !props.disabled
      ? `&:hover {
      background: #2e324e;
      color: #24e059;
      border: 1px solid #24e059;
      box-shadow: -2px -2px 8px #4e5c95, 2px 2px 8px #080c1e;
      cursor: pointer;
    }`
      : `&:hover {
      cursor: not-allowed;
    }
    background-color: #B7B7B7;
    box-shadow: 0;
    `}
  ${({ active }) =>
    active &&
    `
    color: #24e059;
    box-shadow: -2px -2px 8px #4e5c95, 2px 2px 8px #080c1e;
    `}
`;

export const MstLeftBtn = styled(MstBtn)`
  padding-left: 16px;
  justify-content: flex-start;
`;
export const MstPressBtn = styled(MstBtn)`
  box-shadow: -2px -2px 8px #4e5c95, 2px 2px 8px #080c1e;
  ${props =>
    props.disable &&
    `
    background-color: gray;
  `}
  &:focus {
    background: #2e324e;
    color: #24e059;
    border: 1px solid #24e059;
    box-shadow: -2px -2px 8px #4e5c95, 2px 2px 8px #080c1e;
  }

  &:active {
    box-shadow: inset 2px 2px 4px 0px #080c1e, inset -2px -2px 4px 0px #4e5c95;
    background: rgb(25, 25, 25);
  }
`;

export const MstItemCard = styled.div`
  display: flex;
  flex-direction: column;
  padding: 20px 20px 0px 20px;
  gap: 16px;
  &:hover {
    background: #505788;
    & > hr {
      border: none;
    }
  }
  ${({ active }) =>
    active &&
    `
    background:#505788;
    & > hr{
      border:none;
    }
    `}
`;
export const MstDivider = styled.hr`
  width: 100%;
  height: 1px;
  margin: 0;
  border-bottom: 1px solid #000;
  border-top: none;
  border-right: none;
  border-left: none;
`;

export const MstTag = styled.span`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 4px 8px;
  font-size: 14;
  border-radius: 4px;
  color: #e6a23c;
  border: 1px solid #e6a23c;

  ${({ success }) =>
    success &&
    `
        color:#24E059;
        border: 1px solid #24E059;
    `}

  ${({ none }) =>
    none &&
    `
        display:none;
    `}
`;

export const MstDataTime = styled.span`
  font-size: 16px;
  line-height: 16px;
`;

export const MstLeft = styled.section.attrs(props => ({
  width: props.width || "180px",
}))`
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: ${props => props.width};
  border-right: 1px solid #000000;
  padding: 0 20px 20px 20px;
`;

export const MstCenter = styled.section.attrs(props => ({
  width: props.width || "322px",
}))`
  display: flex;
  flex-direction: column;
  width: ${props => props.width};
  border-right: 1px solid #000000;
`;
export const MstRight = styled.section`
  flex: 1;
  display: flex;
  flex-direction: column;
`;
