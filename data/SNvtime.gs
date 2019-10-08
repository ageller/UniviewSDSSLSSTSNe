//precision highp float; //this doesn't seem to change anything.

layout(triangles) in;
layout(triangle_strip, max_vertices = 4) out;

uniform mat4 uv_modelViewProjectionMatrix;
uniform mat4 uv_modelMatrix;
uniform mat4 uv_modelViewInverseMatrix;
uniform vec4 uv_cameraPos;
uniform int uv_simulationtimeDays;
uniform float uv_simulationtimeSeconds;

uniform float radiusScale;
uniform float SNduration;
uniform float SNangleMin;
uniform float SNangleMax;

out vec2 texcoord;
out float sizeFrac;

#define PI 3.1415926535

// axis should be normalized
mat3 rotationMatrix(vec3 axis, float angle)
{
	float s = sin(angle);
	float c = cos(angle);
	float oc = 1.0 - c;
	
	return mat3(oc * axis.x * axis.x + c,           oc * axis.x * axis.y - axis.z * s,  oc * axis.z * axis.x + axis.y * s,
				oc * axis.x * axis.y + axis.z * s,  oc * axis.y * axis.y + c,           oc * axis.y * axis.z - axis.x * s,
				oc * axis.z * axis.x - axis.y * s,  oc * axis.y * axis.z + axis.x * s,  oc * axis.z * axis.z + c);
}

void drawSprite(vec4 position, float radius, float rotation)
{
	vec3 objectSpaceUp = vec3(0, 0, 1);
	vec3 objectSpaceCamera = (uv_modelViewInverseMatrix * vec4(0, 0, 0, 1)).xyz;
	vec3 cameraDirection = normalize(objectSpaceCamera - position.xyz);
	vec3 orthogonalUp = normalize(objectSpaceUp - cameraDirection * dot(cameraDirection, objectSpaceUp));
	vec3 rotatedUp = rotationMatrix(cameraDirection, rotation) * orthogonalUp;
	vec3 side = cross(rotatedUp, cameraDirection);
	texcoord = vec2(0, 1);
	gl_Position = uv_modelViewProjectionMatrix * vec4(position.xyz + radius * (-side + rotatedUp), 1);
	EmitVertex();
	texcoord = vec2(0, 0);
	gl_Position = uv_modelViewProjectionMatrix * vec4(position.xyz + radius * (-side - rotatedUp), 1);
	EmitVertex();
	texcoord = vec2(1, 1);
	gl_Position = uv_modelViewProjectionMatrix * vec4(position.xyz + radius * (side + rotatedUp), 1);
	EmitVertex();
	texcoord = vec2(1, 0);
	gl_Position = uv_modelViewProjectionMatrix * vec4(position.xyz + radius * (side - rotatedUp), 1);
	EmitVertex();
	EndPrimitive();
}

// Equation 7 from [this paper](https://arxiv.org/abs/1612.02097)
float SNIaLum(float t, float A, float t0, float tb, float a1, float a2, float s)
{
	float ar = 2.*(a1 + 1.);
	float ad = a1 - a2;
	float tfac = (t - t0)/tb;
	return A * pow(tfac,ar) * pow( 1. + pow(tfac,(s*ad)), -2./s );
}

void main()
{
	
	//get the time 
	float Uminfract = uv_simulationtimeSeconds/60;
	float eventTime = (uv_simulationtimeDays*24.*60. + Uminfract);

	float time = gl_in[1].gl_Position.x; //minutes
	// allow this to repeat
	float tmin = 5.97734;
	float tmax = 140932.7;
	eventTime = mod(eventTime, tmax); 

	
	vec4 pos = vec4(-gl_in[0].gl_Position.x, -gl_in[0].gl_Position.y, gl_in[0].gl_Position.z, 1.); //these flips in x and y are needed to match stripe 82

	float a1 = 0.1;
	float a2 = -2.2;
	float s = 0.6;
	float tp = SNduration*pow(-1.*(a1 + 1.)/(a2 + 1.), 1./(s*(a1 - a2)) );
	float useT0 = time - tp;

	float size = SNIaLum(eventTime, radiusScale, useT0, SNduration, a1, a2, s);
	//limit the size at peak  based on the camera location
	float sizePeak = SNIaLum(time, radiusScale, useT0, SNduration, a1, a2, s);
	float sizeRatio = size/sizePeak;
	float dist = length(pos.xyz - uv_cameraPos.xyz);
	float angle = atan(sizePeak, 2.*dist);
	if (angle > SNangleMax*PI/180.){
		sizePeak = 2.*dist*tan(SNangleMax*PI/180.);
	}
	if (angle < SNangleMin*PI/180.){
		sizePeak = 2.*dist*tan(SNangleMin*PI/180.);
	}
	size = sizePeak*sizeRatio;
	sizeFrac = (sizePeak - size)/sizePeak;

	if (size > 0){
		drawSprite(pos, size, 0);
	}

}