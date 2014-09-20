library(rjson)
library(RCurl)

hue <- function(light,user="newdeveloper",onoff=T,hue=65000,bri=255,sat=255) {
	resp <- fromJSON(httpPUT(paste0("http://192.168.1.117/api/",user,"/lights/",light,"/state"),
		toJSON(list(on=onoff,hue=hue,bri=bri,sat=sat))))
	invisible(TRUE)
}

rank <- 0.2



# 25000
hue(3,onoff=F,bri=1,sat=1)
hue(2,onoff=F,bri=1,sat=1)
hue(1,onoff=F,bri=1,sat=1)

while(T) {
hue(3,onoff=T,bri=1,sat=1)
hue(1,onoff=F,bri=1,sat=1)

Sys.sleep(.5)

hue(2,onoff=T,bri=1,sat=1)
hue(3,onoff=F,bri=1,sat=1)

Sys.sleep(.5)

hue(1,onoff=T,bri=1,sat=1)
hue(3,onoff=F,bri=1,sat=1)

Sys.sleep(.5)


# hue(3,onoff=T,hue=65000,bri=1)
# hue(2,onoff=T,hue=65000,bri=1)
# hue(1,onoff=T,hue=65000,bri=1)}
}