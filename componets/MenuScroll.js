import gsap from "gsap";

const onEnter = ({ currentTarget }) => {
  gsap.to(currentTarget, {
    x: 0,
    repeatDelay: 1,
    yoyo: true
  });
};

const onLeave = (event) => {
  gsap.to(event.currentTarget, {
    x: -100,
    repeatDelay: 1,
    yoyo: true
  });
};
const MenuScroll = () => (
  <div className="menuScroll" >
    <div
      className="menuItem--menuScroll"
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
    >
      Home
    </div>
    <div
      className="menuItem--menuScroll"
      className="menuItem--menuScroll"
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
    >
      Skills
    </div>
    <div
      className="menuItem--menuScroll"
      className="menuItem--menuScroll"
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
    >
      Proyects
    </div>
  </div>
)

export default MenuScroll;