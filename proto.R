library(dplyr)
setwd("~/source/rainbooze/data/")
txns <- read.csv("transactions.tsv",sep="\t",stringsAsFactors=F,header=F)
names(txns) <- c("datum","transactiestart","kassanr","cassierenr","transactienr","nasanr","imageid",
                 "omschrijving","kassabonomschrijving","inhoud","aantal","gewicht","prijs","aktieindicatie",
                 "pakketnr","pakketomschrijving","artikelkorting","bonusvoordeel","wagnr","assgroepnr",
                 "eancode","zegels","notimportant")
grps <- read.csv("groups.tsv",sep="\t",stringsAsFactors=F,header=F)
names(grps) <- c("assgroepnr","assgroepname","assgroeprank")

# fix transaction numbers
keyset <- tidset <- txns %>% group_by(datum,kassanr,cassierenr,transactiestart,transactienr) %>% summarize()
keyset$rtid <- 1:nrow(keyset)
txns <- txns %>% inner_join(keyset,by=c("datum","kassanr","cassierenr","transactiestart","transactienr"))
write.table(txns,"transactions.tsv",sep="\t",quote=F,row.names=F,col.names=F)

# 
# prodnames <- txns %>% group_by(eancode,omschrijving) %>% summarise() %>% mutate(omclean=gsub("(^ah )|([^a-z ]+)","",omschrijving,perl=T)) %>% arrange(omclean)
# 
# nuts <-do.call("rbind",lapply(prodnames$omclean,function(name){
#   print(name)
#   
#   dd <- fromJSON(file=paste0("http://localhost:8888/prodinfo?q=",URLencode(name)), method='C')
#   if (length(dd) < 1) {
#     return(NA)
#   }
#   #print(dd)
#   dd
#   }))
# nut <- as.data.frame(nuts)
# 
# nut$ean <- prodnames$eancode
# nut$oname <- prodnames$omschrijving
# head(nut)
# 
# nut$name <- as.character(nut$name)
# nut$calories <- as.numeric(nut$calories)
# nut$sugars <- as.numeric(as.character(nut$sugars))
# nut$sat_fat <- as.numeric(as.character(nut$sat_fat))
# nut$unsat_fat <- as.numeric(as.character(nut$unsat_fat))
# nut$fibers <- as.numeric(as.character(nut$fibers))
# nut$carbs <- as.numeric(as.character(nut$carbs))
# nut$cholestrol <- as.numeric(as.character(nut$cholestrol))
# nut$protein <- as.numeric(as.character(nut$protein))
# nut$emotion <- as.numeric(as.character(nut$emotion))
# 
# nut$healthy <- as.numeric(as.character(nut$healthy))
# 
# nut$eancode <- nut$eanstr

nutritional <- txns %>% left_join(nut,by="eancode") %>% left_join(grps,by="assgroepnr") %>% 
  mutate(finalrank=ifelse(is.na(healthy),assgroeprank,round(((healthy-5)/2+assgroeprank)/2,2))) 

write.table(select(nutritional,ean,finalrank,calories,sugars,sat_fat,unsat_fat,fibers,carbs,cholestrol,protein),
            "nutritional.tsv",sep="\t",quote=F,row.names=F,col.names=F)


avgranks <- as.data.frame(nutritional %>% group_by(rtid) %>% summarize(avgrank=mean(finalrank)) %>% select(rtid,avgrank))
avgranks$user <- round(runif(nrow(profiles),min=3,max=50))

goodtxns <- c(sample(avgranks[avgranks$avgrank > 0.5,1],10),sample(avgranks[avgranks$avgrank < 0,1],3))
avgranks[avgranks$rtid %in% goodtxns,]$user <- 1
badtxns <- c(sample(avgranks[avgranks$avgrank > 0,1],3),sample(avgranks[avgranks$avgrank < -0.5,1],10))
avgranks[avgranks$rtid %in% badtxns,]$user <- 2

dates <- seq(as.Date("2014-08-20"), as.Date("2014-09-21"), by="days")
avgranks$date <- sample(dates,nrow(profiles),replace=T)
profiles <- avgranks %>% select(rtid,user,date)
write.table(profiles,"profiles.tsv",sep="\t",quote=F,row.names=F,col.names=F)


# library(ggplot2)
# library(ggthemes)
# thm <- theme_few(base_size = 14)
# ddd <- res %>% group_by(hod) %>% summarize(n=n(),ar=mean(rank))
# ggplot(ddd, aes(x=hod,y=ar,group=1)) + 
#   geom_line() + geom_point() +
# #  theme + xlab("Hour of day") + ylab("Delay (min/km)") + ggtitle("New York Taxi Delays by Hour")
#   



