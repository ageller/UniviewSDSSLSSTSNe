uniform float uv_fade;
uniform mat4 uv_scene2ObjectMatrix;
uniform vec4 uv_cameraPos;

//uniform sampler2D cmap1;
//uniform sampler2D cmap2;

in vec2 texcoord;
in float log10lum;
in float type;
in float time;
in float dflag;

out vec4 fragColor;

void main()
{
	float lmean = 9.2431;
	float lstd = 0.2506;
	//float colorOffset = clamp((log10lum - lmean)/(3.*lstd), -0.9, 0.9); //only have luminosities for the true SNe
	float colorOffset = -0.9 + 2.*clamp(type, 0., 0.9);
	
	//vec3 color = texture(cmap1 ,vec2(clamp(type, 0., 0.99), 0.5)).rgb;
	vec3 color = vec3(0,1,1); //cyan
	color.b += colorOffset;
	color.g -= colorOffset;
	
	if (time > 2020){ //LSST
		//color = texture(cmap2 ,vec2(clamp(type, 0., 0.99), 0.5)).rgb;
		color = vec3(1,0,1); //magenta
		color.r += colorOffset;
		color.b -= colorOffset;
	}


	//color *= (1. + colorOffset);
	//color += vec3(colorOffset);
	
	vec2 fromCenter = texcoord*2. - vec2(1.);
	float dist = dot(fromCenter, fromCenter);
	float alphaScale = 1.;
	if (dist > 1){
		discard;
	}
	if (dist < 0.9 && dist > 0.1){
		alphaScale = 0.3;
	}

	fragColor = vec4(color, uv_fade*alphaScale);

	//fade out as we move from origin
	if (dflag < 0){
		vec3 camPos = (uv_scene2ObjectMatrix*uv_cameraPos).xyz;
		fragColor.a *= (1. - smoothstep(0.00001, 0.1, clamp(length(camPos), 0.00001, 0.1)));
	}

	//fragColor.a *= exp(-0.5*dist/0.1);
	//fragColor.a *= smooth(dist);

}
