import _ from "lodash";
import React, { FC } from "react";
import classnames from "classnames";
import McBox from "components/mc-box";
import McIcon from "components/mc-icon";
import { index2label, index2field } from "misc/util";

interface IProps {
  hash: McTelegramHash;
  role: "head" | "body";
  type: TelegramBizType;
  active: number;
  offset: number;
  count: number; //显示几个格子
  onPrev: () => void;
  onNext: () => void;
  onActive: (index: number) => void;
  onLocate: (value: string) => void;
  onChange: (role: "head" | "body", field: string, value: string) => void;
}

const McTable: FC<IProps> = props => {
  return (
    <div className="mc-code-modal__table">
      <McBox display="flex" flexDirection="row">
        <button onClick={() => props.onPrev()} className="mc-code-modal__prev">
          <McIcon>prev</McIcon>
        </button>
        {_.range(props.count).map(ix => {
          const field = index2field(props.offset + ix, props.type, props.role);
          const found = props.hash[field];
          return found ? (
            <input
              key={ix}
              value={found.value}
              maxLength={20}
              onChange={event => props.onChange(props.role, field, event.currentTarget.value)}
              onClick={() => props.onActive(ix)}
              className={classnames("mc-code-modal__cell", {
                "mc-code-modal__cell--hover": found,
                "mc-code-modal__cell--focus": props.active === ix,
              })}
            />
          ) : (
            <div key={ix} className="mc-code-modal__cell" />
          );
        })}
        <button onClick={() => props.onNext()} className="mc-code-modal__next">
          <McIcon>next</McIcon>
        </button>
      </McBox>
      <McBox display="flex" marginTop="16px" flexDirection="row" justifyContent="center">
        {_.range(props.count).map(ix => (
          <div
            key={ix}
            className={classnames("mc-code-modal__cell", {
              "mc-code-modal__cell--micro": 1,
              "mc-code-modal__cell--active": props.active === ix,
            })}
          >
            {index2label(props.offset + ix, props.type, props.role)}
          </div>
        ))}
      </McBox>
      <input
        type="text"
        className="mc-code-modal__grab"
        placeholder="请输入指令快速定位"
        onKeyDown={event => {
          const value = event.currentTarget.value.trim();
          if (value && event.keyCode === 13) {
            props.onLocate(value.toUpperCase());
          }
        }}
      />
    </div>
  );
};

export default McTable;
