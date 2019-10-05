uniform float uv_fade;

in vec2 texcoord;
in float sizeFrac;

out vec4 fragColor;

void main()
{
	vec3 color = vec3(1.);
	
	vec2 fromCenter = texcoord*2. - vec2(1.);
	float dist = dot(fromCenter, fromCenter);

	fragColor = vec4(color, uv_fade);
	//give a little color variation
	fragColor.gb *= (0.1 + sizeFrac/2.);

	//fragColor.a *= exp(-0.5*dist/0.1);
	fragColor.a *= smoothstep(1,0,dist);

}
