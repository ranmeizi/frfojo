import { Span } from "./Styled";

type Props = {
  title: string;
};

export default function Logo({ title }: Props) {
  return (
    <Span className="logo">
      <span className="left blue">&lt;&nbsp;</span>
      {title}
      <span className="right blue">&nbsp;&gt;</span>
    </Span>
  );
}
