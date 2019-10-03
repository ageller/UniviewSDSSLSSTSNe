uniform float uv_fade;

in vec2 texcoord;

out vec4 fragColor;

void main()
{
	vec3 color = vec3(1.);
	
	vec2 fromCenter = texcoord*2. - vec2(1.);
	float dist = dot(fromCenter, fromCenter);

	fragColor = vec4(color, uv_fade);

	//fragColor.a *= exp(-0.5*dist/0.1);
	fragColor.a *= smoothstep(1,0,dist);

}
