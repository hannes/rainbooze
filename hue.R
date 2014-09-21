library(rjson)
library(RCurl)

hue <- function(ip,light,user="newdeveloper",onoff=T,hue=65000,bri=255,sat=255) {
	resp <- fromJSON(httpPUT(paste0("http://",ip,"/api/",user,"/lights/",light,"/state"),
		toJSON(list(on=onoff,hue=hue,bri=bri,sat=sat))))
	invisible(TRUE)
}

hue(ip="192.168.2.4",3,onoff=F,bri=1,sat=1)
hue(ip="192.168.2.4",2,onoff=F,bri=1,sat=1)
hue(ip="192.168.2.4",1,onoff=F,bri=1,sat=1)

ip <- "192.168.2.4"
red <- 65000
green <- 25000
orange <- 10000

rank <- -42
while(TRUE) {
	orank <- rank
	rank <- fromJSON(file="http://do.u0d.de:8888/lastrank")
	if (orank != rank) {
		if (rank < -.5) {
			hue(ip=ip,3,onoff=T,hue=red,bri=255,sat=255)
			hue(ip=ip,2,onoff=T,hue=red,bri=255,sat=255)
			hue(ip=ip,1,onoff=T,hue=red,bri=255,sat=255)
			next
		}
		if (rank >= -.5 && rank <= 0) {
			hue(ip=ip,3,onoff=T,hue=green,bri=255,sat=255)
			hue(ip=ip,2,onoff=T,hue=orange,bri=255,sat=255)
			hue(ip=ip,1,onoff=T,hue=red,bri=255,sat=255)
			next
		}
		if (rank > 0 && rank <= .5) {
			hue(ip=ip,3,onoff=T,hue=green,bri=255,sat=255)
			hue(ip=ip,2,onoff=T,hue=green,bri=255,sat=255)
			hue(ip=ip,1,onoff=T,hue=red,bri=255,sat=255)
			next
		}
		if (rank > .5) {
			hue(ip=ip,3,onoff=T,hue=green,bri=255,sat=255)
			hue(ip=ip,2,onoff=T,hue=green,bri=255,sat=255)
			hue(ip=ip,1,onoff=T,hue=green,bri=255,sat=255)
			next
		}

	}
	Sys.sleep(.2)
}
