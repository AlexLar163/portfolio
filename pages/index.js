import IconReact from '../assets/iconos/react.png'
import IconAngular from '../assets/iconos/angular.png'
import IconVue from '../assets/iconos/vue.png'
import IconBabel from '../assets/iconos/babel.png'
import IconCss from '../assets/iconos/css.png'
import IconDocker from '../assets/iconos/docker.png'
import IconExpress from '../assets/iconos/express.png'
import IconGit from '../assets/iconos/git.png'
import IconHtml from '../assets/iconos/html.png'
import IconIonic from '../assets/iconos/ionic.png'
import IconJavascript from '../assets/iconos/javascript.png'
import IconLaravel from '../assets/iconos/laravel.png'
import IconMongo from '../assets/iconos/mongodb.png'
import IconMysql from '../assets/iconos/mysql.png'
import IconNest from '../assets/iconos/nest.png'
import IconNode from '../assets/iconos/node.png'
import IconPhp from '../assets/iconos/php.png'
import IconPostgresql from '../assets/iconos/postgresql.png'
import IconReactNative from '../assets/iconos/react-native.png'
import IconSass from '../assets/iconos/sass.png'
import IconWebpack from '../assets/iconos/webpack.png'
import IconNext from '../assets/iconos/next.png'

import gsap, { TimelineMax } from "gsap";


const icons = [
	IconAngular,
	IconBabel,
	IconCss,
	IconGit,
	IconHtml,
	IconIonic,
	IconNext,
	IconJavascript,
	IconLaravel,
	IconMongo,
	IconMysql,
	IconNest,
	IconReact,
	IconVue,
	IconDocker,
	IconExpress,
	IconNode,
	IconPhp,
	IconPostgresql,
	IconReactNative,
	IconSass,
	IconWebpack,
]

const onEnter = (event, index) => {
	let target = document.getElementById(index)
	let tl = gsap.timeline();
	tl.to(target, { rotationX: 360 })
};

const onLeave = (event, index) => {
	let target = document.getElementById(index)
	let tl = gsap.timeline();
	tl.to(target, { rotationX: 0 })
};

const Index = () => (
	<>
		<h1>SKILLS</h1>
		<main className="main">
			{icons.map((item, index) => (
				<div
					key={index}
					onMouseEnter={(event) => onEnter(event, index)}
					onMouseLeave={(event) => onLeave(event, index)}
				>
					<img
						src={item}
						key={index}
						id={index}
						className={
							`icon--main ${(index % 2 === 0) ? 'icon1' : 'icon2'}`
						}
					/>
				</div>
			))}
		</main >
	</>
);

export default Index;
