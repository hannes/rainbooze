library(dplyr)
setwd("~/source/rainbooze/")
txns <- read.csv("transactions.tsv",sep="\t",stringsAsFactors=F,header=F)
names(txns) <- c("datum","transactiestart","kassanr","cassierenr","transactienr","nasanr","imageid",
                 "omschrijving","kassabonomschrijving","inhoud","aantal","gewicht","prijs","aktieindicatie",
                 "pakketnr","pakketomschrijving","artikelkorting","bonusvoordeel","wagnr","assgroepnr",
                 "eancode","zegels","notimportant")
grps <- read.csv("groups.tsv",sep="\t",stringsAsFactors=F,header=F)
names(grps) <- c("assgroepnr","assgroepname","assgroeprank")

res <- mutate(txns,transactienr,transactiestart,hod=as.integer(substring(transactiestart,1,2))) %>% left_join(grps,by="assgroepnr") %>% 
  group_by(transactienr) %>% summarize(n=n(),rank=round(mean(assgroeprank),2)) %>% arrange(rank)
res

titles <- head(gsub("( |^)\\w{1,2}( |$)"," ",gsub("(^ah )|([^a-z ]+)","",unique(txns$omschrijving),perl=T)),100)

library(ggplot2)
library(ggthemes)
thm <- theme_few(base_size = 14)
ddd <- res %>% group_by(hod) %>% summarize(n=n(),ar=mean(rank))
ggplot(ddd, aes(x=hod,y=ar,group=1)) + 
  geom_line() + geom_point() +
#  theme + xlab("Hour of day") + ylab("Delay (min/km)") + ggtitle("New York Taxi Delays by Hour")
  

prodnames <- txns %>% group_by(eancode,omschrijving) %>% summarise() %>% mutate(omclean=gsub("( |^)\\w{1,2}( |$)"," ",gsub("(^ah )|([^a-z ]+)","",omschrijving,perl=T)))

  